const Router = require('koa-router');
const puppeteer = require('puppeteer');
const config = require('../config/config');
const db = require('../lib/db.js');
const crawler = new Router();

let browser;

// 截屏
async function screenShot(req) {
  (async () => {
    console.log(req.query)
    const url = req.query.url || 'https://xueqiu.com/v4/stock/quote.json?code=SZ000001';
    console.log(url);

    const page = await browser.newPage();

    console.log("Cookies:", await page.cookies('https://xueqiu.com/v4/stock/quote.json?code=SZ000001'));
    const cookies = [
      /*{
        name: 'aliyungf_tc',
        value: 'AQAAAEP2YHGtPQ4ARKyHPRRK/MY/3FVf',
        domain: 'xueqiu.com',
        path: '/',
        size: 4,
        httpOnly: false,
        secure: false,
        session: true,
      },
      {
        name: 'device_id',
        value: '91c4bb1b29f4da41ded9980363d48137',
        domain: 'xueqiu.com',
        path: '/',
        size: 4,
        httpOnly: false,
        secure: false,
        session: true,
      },*/
      {
        name: 'xq_a_token',
        value: '019174f18bf425d22c8e965e48243d9fcfbd2cc0',
        domain: 'xueqiu.com',
        path: '/',
        size: 4,
        httpOnly: false,
        secure: false,
        session: true,
      },
      {
        name: 'xq_r_token',
        value: '2d465aa5d312fbe8d88b4e7de81e1e915de7989a',
        domain: 'xueqiu.com',
        path: '/',
        size: 4,
        httpOnly: false,
        secure: false,
        session: true,
      },
    ];
    await page.setCookie(...cookies);
    await page.goto(url);
    await page.screenshot({
      path: 'test/test.png',
      // fullPage: true,
      width: 1920,
      height: 1000
    });
    await browser.close();
  })();
}

// 抓取163的音乐及评论
async function getStock() {
  const page = await browser.newPage();
  await page.setCookie(...config.cookies);
  await page.goto('https://xueqiu.com/v4/stock/quote.json?code=SZ000001');
  console.log('getStock');
  const content = await page.$eval('body', ele => ele.innerText);
  // console.log(typeof content, JSON.parse(content))

  const data = JSON.parse(content);
  const sql = 'insert into stock (`symbol`, `name`) values (?,?)';
  const symbol = data['SZ000001'].symbol;
  const name = data['SZ000001'].name;
  const param = [];
  param.push(symbol);
  param.push(name);
  console.log(sql, param);
  db(sql, param).then(res => {
    console.log(res);
  })
  return content;
}


// 抓取163的音乐及评论
async function getMusic() {
  const page = await browser.newPage();
  await page.goto('https://music.163.com/#');
  // 获取输入框焦点并输入文字
  await page.type('#srch', '毛不易', {delay: 0});
  // 回车: 模拟键盘按下某个按键
  await page.keyboard.press('Enter');

  await page.waitFor(1000);
  const frame = await page.frames().find( f => f.name() === 'contentFrame');
  const songlistElt = await frame.$('.srchsongst');

}

crawler.get('/shot', async (ctx, next) => {
  // ctx.body = 'loading';
  browser = await puppeteer.launch();
  screenShot(ctx.request);
  console.log(`${ctx.method} ${ctx.url}`);
  // ctx.body = 'loading';
  ctx.body = '<img src="/test.png">';
})
.get('/music', async (ctx) => {
  browser = await puppeteer.launch();
  // getMusic();
  ctx.body = '<img src="//stdl.qq.com/stdl/me_center/main/static/img/lottery.e62afc1.png">';
})
.get('/stock', async (ctx) => {
  browser = await puppeteer.launch();
  content = await getStock();
  ctx.body = content;
});

module.exports = crawler;
