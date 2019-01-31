import fs from 'fs'
import path from 'path'
import Koa from 'koa'
import koaLogger from 'koa-logger'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import mount from 'koa-mount'
import api from './api_v1'

const router = new Router()
const app = new Koa()

if (__DEV__ || __TEST__)
  app.use(koaLogger())
app
  .use(bodyParser())
  .use(router.routes())
  .use(mount('/api/v1',api.routes()))

if (__DEV__) {
  const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
  const koaWebpack = require('koa-webpack')
  const serve = require('koa-static')
  const [webConfig, ] = requireFunc('../tools/app.webpack.config.js')()
  koaWebpack({
    config: webConfig,
    devMiddleware: {index:false}
  }).then(middleware => {
    app.use(middleware)
    app.use(serve('./static')) 
    app.use(async (ctx, next) => {
      if (ctx.request.method === 'POST') {
        return next()
      }
      const filename = path.resolve(webConfig.output.path, 'index.html')
      const index = fs.readFileSync(filename,{encoding:'utf8'})
      ctx.response.type = 'html'
      ctx.response.body = index
    })
  })
} 
export default app
