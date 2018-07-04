const fs = require('fs');
const Koa = require('koa');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser')
const app = new Koa();
const Router = require('koa-router');

// 使用ctx.body解析中间件
app.use(bodyParser());

const staticOpts = {
  maxage: 0,
  hidden: false,
  index: 'index.html',
  defer: true,
  gzip: true
}

app.use(static('./public/src'), staticOpts);
app.use(static('./test'), staticOpts);
// app.use(static('./test'), staticOpts);
// app.use('/test', static('./test'), staticOpts);

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
function render( page ) {
  return new Promise(( resolve, reject ) => {
    let viewUrl = `./view/${page}`
    fs.readFile(viewUrl, "binary", ( err, data ) => {
      if ( err ) {
        reject( err )
      } else {
        resolve( data )
      }
    })
  })
}

/**
 * 根据URL获取HTML内容
 * @param  {string} url koa2上下文的url，ctx.url
 * @return {string}     获取HTML文件内容
*/
async function route( url ) {
  let view = '' //'404.html'
  switch ( url ) {
    case '/':
      view = 'index.html'
      break
    case '/index':
      view = 'index.html'
      break
    case '/404':
      view = '404.html'
      break
    default:
      break
  }
  let html = await render( view )
  return html
}

// 装载所有子路由
const router = new Router();
const home = require('./routes/index.js');
const crawler = require('./routes/craw.js');
const stock = require('./routes/stock.js');
const api = require('./routes/api.js');

router.use('/index', home.routes(), home.allowedMethods());
router.use('/data', crawler.routes(), crawler.allowedMethods());
router.use('/stock', stock.routes(), stock.allowedMethods());
router.use('/api', api.routes(), api.allowedMethods());
// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
console.log('crawler is starting at port 3000.');
