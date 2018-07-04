const Router = require('koa-router');
const config = require('../config/config');
const db = require('../lib/db.js');
const api = new Router();

// 估值表排序数据 /api/base?s=pe_ttm
// 价格排序数据 /api/price?code=SZ000002&count=10

// 从估值表获取排序数据
async function getOrderedData(type, query = 'pe_lyr') {

  const selectSql = `SELECT s.symbol, s.name, v.pe_lyr, v.pe_ttm, v.pb, v.roe
  FROM stock as s LEFT JOIN valuation as v ON s.symbol=v.symbol WHERE v.${query} > 0 ORDER BY v.${query} asc `;
  console.log(selectSql);
  return await db(selectSql, []);

}

async function getPirceData(code = '', count = 120) {
  const sql = `SELECT open,close,low,high,volume,UNIX_TIMESTAMP(time) AS time FROM price where symbol=? order by time desc limit 0, ?`;
  const params = [code, Number(count)];
  console.log(sql);
  return await db(sql, params);
}

// get data from db
api.get('/:interface/:op?', async (ctx) => {
  const type = ctx.params.interface;
  const op = ctx.params.op;
  const query = ctx.query;
  console.log('query', query);
  console.log('type', type);

  switch(type) {
    case 'base':
      const data = await getOrderedData(type, query.s);
      ctx.body = {
        error: 0,
        type: query.s || 'pe_lyr',
        data: data
      };
      break;
    case 'valuation':
      getData('VALUE');
      ctx.body = 'valuation';
      break;
    case 'report':
      getData('REPORT');
      ctx.body = 'financial_report';
      break;
    case 'price':
      ctx.body = {
        error: 0,
        code: query.code || '',
        data: await getPirceData(query.code, query.count)
      };
      break;
    default:
      ctx.body = type + '_' + op;
      break;
  }

});

module.exports = api;
