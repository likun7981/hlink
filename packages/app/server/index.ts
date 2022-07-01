import { Koa } from './kit/base.js'
import formatResponse from './middleware/formatResponse.js'
import time from './middleware/time.js'
import serve from 'koa-static'
import router from './router.js'
import __dirname from './kit/__dirname.js'
import compress from 'koa-compress'
import path from 'node:path'
import { log } from '@hlink/core'

const app = new Koa()

const port = process.env.PORT || 9090

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

app.listen(process.env.PORT || 9090, () => {
  log.success('hlink serve started', `http://localhost:${port}`)
})
