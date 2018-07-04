const config = {};

const cookies = [
  {
    name: 'xq_a_token',
    value: '7443762eee8f6a162df9eef231aa080d60705b21',
    domain: 'stock.xueqiu.com',
    path: '/',
    httpOnly: false,
    secure: false,
    session: true,
  },
  {
    name: 'xq_r_token',
    value: '9ca9ab04037f292f4d5b0683b20266c0133bd863',
    domain: 'stock.xueqiu.com',
    path: '/',
    httpOnly: false,
    secure: false,
    session: true,
  }
];

config.cookies = cookies;

config.base_url = 'https://xueqiu.com/v4/stock/quote.json';
config.report_url = 'https://xueqiu.com/stock/f10/finmainindex.json';
// type: normal|before|after
// period: day|week|month|quarter|year
config.price_url = 'https://stock.xueqiu.com/v5/stock/chart/kline.json?period=day&type=normal&count=-7280&indicator=kline';

config.local = {
  mysql: {
    connectionLimit: 2,
    host: '127.0.0.1',
    user: 'root',
    password: 'angelia163',
    port: 3306,
    database: 'finance',
    multipleStatements: true
  }
}

config.development = {
  mysql: {
    connectionLimit: 2,
    host: '127.0.0.1',
    user: 'root',
    password: 'angelia163',
    port: 3306,
    database: 'finance',
    multipleStatements: true
  }
}

module.exports = config;
