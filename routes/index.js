const Router = require('koa-router')
const home = new Router();

home.get('/', async ( ctx )=>{
  let html = `
    <ul>
      <li><a href="/data">/data</a></li>
      <li><a href="/page/404">/page/404</a></li>
    </ul>
  `
  ctx.body = html
})
module.exports = home;
