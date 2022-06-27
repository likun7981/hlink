import { Koa } from './kit/base.js'
import formatResponse from './middleware/formatResponse.js'
import time from './middleware/time.js'
import sse from './middleware/sse.js'
import router from './router.js'

const app = new Koa()

app
  .use(time)
  .use(formatResponse)
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(9090, () => {
  console.log('listening', 'http://localhost:9090')
})
