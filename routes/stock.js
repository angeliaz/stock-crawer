const Router = require('koa-router');
const puppeteer = require('puppeteer');
const config = require('../config/config');
const db = require('../lib/db.js')
const crawler = new Router();

let page;

/**
 * [arr description]
 * 000 深证A股
 * 002 深证A股中小企业股票
 * 200 深证B股
 * 300 创业板
 * 400 三板市场
 * 600 上证A股
 * 900 上交所B股
 * SZ 000001 300001 200
 * SH 600001 900
 */
const arr = [000, 002, 200, 300, 600, 601, 602, 900];
const rangeArr = [
  {min: 1, max: 1000},
  {min: 2000, max: 3000},
  {min: 200000, max: 201000},
  {min: 300000, max: 301000},
  {min: 600000, max: 603000},
  {min: 900000, max: 901000}
];
let rangeIndex = 5;
let id = 900500 //rangeArr[rangeIndex].min;

function formatNum(num) {
  if (num >= 100000) return '' + num;
  if (num >= 10000) return '0' + num;
  if (num >= 1000 && num < 10000) return '00' + num;
  if (num >= 100 && num < 1000) return '000' + num;
  if (num >= 10 & num < 100) return '0000' + num;
  if (num < 10) return '00000' + num;
}

function continueFetch() {
  console.log(50, id)
  if (id < rangeArr[rangeIndex].max) {
    id++;
  } else {
    rangeIndex++;
    id = rangeArr[rangeIndex].min;
  }
  getStockBase();
}

async function initPuppeteer() {
  if (!page) {
    const browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setCookie(...config.cookies);
  }
}

let baseId = 0;
async function getStockDetail(type) {
  const limit = type === 'REPORT' ? 1 : 2;
  const selectSql = 'select id,symbol from stock order by id asc limit ?,?';
  const selectParam = [baseId*limit, limit];
  db(selectSql, selectParam).then(async selectRes => {
    baseId++;
    if (selectRes.length) {
      await loopSelectData(selectRes, type);
      await page.waitFor(1000);
      getStockDetail(type);
    }
  });
}

async function loopSelectData(data, type) {
  for (const item of data) {
    if (type === 'VALUE') {
      await inserToValuation(item);
    } else if (type === 'REPORT') {
      await insertToReportTable(item);
    } else if (type === 'PRICE') {
      console.log(item);
      await insertToPriceTable(item);
    }
    await page.waitFor(100);
  }
}

// 价格表
async function insertToPriceTable(item) {
  // 查询过去所有的价格(不复权)
  const stockId = item.symbol;
  const url = config.price_url + '&symbol=' + stockId + '&begin=' + Date.now();
  await page.setCookie(...config.cookies);
  await page.waitFor(1000);
  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  });
  console.log(url);

  const content = await page.$eval('body', ele => ele.innerText);
  const parseData = JSON.parse(content);

  if (!parseData.errcode && parseData.data && parseData.data.item) {
    const list = parseData.data.item;

    // udpate base table(ipo_time, ipo_price)
    const firstPrice = list[0];
    const base_sql = 'update stock set ipo_time=?, ipo_price=? where symbol=?';
    const base_param = [new Date(firstPrice[0]), firstPrice[5], stockId];
    console.log(base_sql, base_param);
    const baseUpdateRes = await db(base_sql, base_param);
    console.log(baseUpdateRes);

    // add or update to price table
    for (const priceItem of list) {
      const selectSql = `select id from price where symbol=? and time=?`;
      const selectParam = [stockId, new Date(priceItem[0])];
      const selectRes = await db(selectSql, selectParam);

      const param = [];
      param.push(stockId);
      param.push(priceItem[1]);
      param.push(priceItem[2]);
      param.push(priceItem[5]); // close
      param.push(priceItem[4]);
      param.push(priceItem[3]); // high
      param.push(new Date(priceItem[0]));

      if (selectRes.length) {
        sql = 'update price set symbol=?, volume=?, open=?, close=?, low=?, high=?, time=? where symbol=? and time=?';
        param.push(stockId);
        param.push(new Date(priceItem[0]));
      } else {
        sql = 'insert into price (symbol, volume, open, close, low, high, time) values (?,?,?,?,?,?,?)';
      }
      console.log(sql);
      const insertRes = await db(sql, param);
      console.log((selectRes.length ? 'udpate ' : 'insert '), stockId);
    }
  }

}

// 过去10年的财报数据
async function insertToReportTable(item) {

  const size = 41;
  const stockId = item.symbol;
  const url = config.report_url + '?symbol=' + stockId + '&page=1&size=' + size + '&t=' + Date.now();
  await page.goto(url);
  const content = await page.$eval('body', ele => ele.innerText);
  const parseData = JSON.parse(content);

  if (!parseData.errcode && parseData.list) {
    const list = parseData.list;

    for (const reportItem of list) {
      // 先查询financial_report是否有日期的数据，若有则更新
      const selectSql = `select id from financial_report where  symbol=? and reportdate=?`;
      // const selectParam = [stockId];
      const selectParam = [stockId, reportItem.reportdate];
      // console.log(selectSql, selectParam)
      const selectRes = await db(selectSql, selectParam);
      // console.log(selectRes);
      const param = [];
      param.push(stockId);
      param.push(reportItem.dilutedroe || 0);
      param.push(reportItem.weightedroe || 0);
      param.push(reportItem.netincgrowrate || 0);
      param.push(reportItem.mainbusincgrowrate || 0);
      param.push(reportItem.netassgrowrate || 0);
      param.push(reportItem.totassgrowrate || 0);
      param.push(reportItem.netprofit || 0);
      param.push(reportItem.salegrossprofitrto || 0);
      param.push(reportItem.cashnetr || 0);
      param.push(reportItem.cashequfinbal || 0);
      param.push(reportItem.totalliab || 0);
      param.push(reportItem.totalassets || 0);
      param.push(reportItem.reportdate || '');

      if (selectRes.length) {
        sql = 'update financial_report set symbol=?, dilutedroe=?, weightedroe=?, netincgrowrate=?, mainbusincgrowrate=?, netassgrowrate=?, totassgrowrate=?, netprofit=?, salegrossprofitrto=?, cashnetr=?, cashequfinbal=?, totalliab=?, totalassets=?, reportdate=? where symbol=? and reportdate=?';
        param.push(stockId);
        param.push(reportItem.reportdate || '');
      } else {
        sql = 'insert into financial_report (symbol, dilutedroe, weightedroe, netincgrowrate, mainbusincgrowrate, netassgrowrate, totassgrowrate, netprofit, salegrossprofitrto, cashnetr, cashequfinbal, totalliab, totalassets, reportdate) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      }
      console.log(sql);
      const insertRes = await db(sql, param);
      console.log((selectRes.length ? 'udpate ' : 'insert '), stockId);
    }

  }

}

/**
 * 插入至valuation
 * @param  {Array} data 从base表取出数据
 */
async function inserToValuation(item) {

  const stockId = item.symbol;
  const url = config.base_url + '?code=' + stockId;
  await page.goto(url);

  const content = await page.$eval('body', ele => ele.innerText);
  const parseData = JSON.parse(content);
  if (!parseData.errcode && parseData[stockId]) {
    const stockData = parseData[stockId];
    const selectSql = 'select id from valuation where symbol=?';
    const selectParam = [item.symbol];

    const selectRes = await db(selectSql, selectParam);
    const param = [];
    param.push(stockData.symbol);
    param.push(stockData.pe_lyr || 0);
    param.push(stockData.pe_ttm || 0);
    param.push(stockData.pb || 0);
    param.push(new Date(stockData.time));
    let sql;
    if (selectRes.length) {
      sql = 'update valuation set symbol=?, pe_lyr=?, pe_ttm=?, pb=?, time=? where symbol=?';
      param.push(stockData.symbol);
    } else {
      sql = 'insert into valuation (symbol, pe_lyr, pe_ttm, pb, time) values (?,?,?,?,?)';
    }
    const insertRes = await db(sql, param);
    console.log((selectRes.length ? 'udpate ' : 'insert '), stockId);
  }
}

async function getStockBase() {
  const stockId = (id < 600000 ?  'SZ' : 'SH') + formatNum(id);
  const url = config.base_url + '?code=' + stockId;

  await page.goto(url);
  const content = await page.$eval('body', ele => ele.innerText);
  const data = JSON.parse(content);

  if (!data.errcode && data[stockId]) {
    const stockData = data[stockId];
    const selectSql = 'select id from stock where symbol=?';
    const selectParam = [stockData.symbol];
    db(selectSql, selectParam).then(selectRes => {
      // console.log('selectRes', selectRes);
      let sql;
      const param = [];
      param.push(stockData.symbol);
      param.push(stockData.name);
      param.push(stockData.currency_unit);
      param.push(stockData.exchange);
      if (selectRes.length) {
        sql = 'update stock set symbol=?, name=?, currency=?, exchange=?, ipo_exchanges=? where symbol=?';
        param.push(stockData.exchange);
        param.push(stockData.symbol);
      } else {
        sql = 'insert into stock (symbol, name, currency,   exchange) values (?,?,?,?)';
      }
      // console.log(sql, param);
      db(sql, param).then(res => {
        console.log('写入成功', stockId);
        continueFetch();
      });
    });
  } else {
    continueFetch();
  }
}

crawler.get('/:interface/:op?', async (ctx) => {
  const type = ctx.params.interface;
  const op = ctx.params.op;
  const query = ctx.query;
  console.log('query', query);
  console.log('type', type);

  await initPuppeteer();
  switch(type) {
    case 'base':
      getStockBase();
      ctx.body = 'get base data';
      break;
    case 'valuation':
      getStockDetail('VALUE');
      ctx.body = 'valuation';
      break;
    case 'report':
      getStockDetail('REPORT');
      ctx.body = 'financial_report';
      break;
    case 'price':
      getStockDetail('PRICE');
      ctx.body = 'price';
      break;
    default:
      ctx.body = type + '_' + op;
      break;
  }

});

crawler.post('/:interface/:op?', async (ctx) => {
  const type = ctx.params.interface;
  const op = ctx.params.op;
  const query = ctx.query;
  const body = ctx.request.body;
  console.log('body', body);
  ctx.body = body;
});

module.exports = crawler;
