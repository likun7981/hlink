import { Koa } from './kit/base.js'
import formatResponse from './middleware/formatResponse.js'
import time from './middleware/time.js'
import serve from 'koa-static'
import router from './router.js'
import __dirname from './kit/__dirname.js'
import compress from 'koa-compress'
import path from 'node:path'

const app = new Koa()

app
  .use(
    compress({
      br: false, // br实时压缩太慢，使用构建时直接压缩
    })
  )
  .use(serve(path.join(__dirname(import.meta.url), 'web')))
  .use(time)
  .use(formatResponse)
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(9090, () => {
  console.log('listening', 'http://localhost:9090')
})
