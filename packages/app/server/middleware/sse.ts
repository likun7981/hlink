import { PassThrough } from 'node:stream'
import { Middleware } from '../kit/base.js'

function sse(paths?: string[]): Middleware {
  return async function sse(ctx, next) {
    if (paths && !paths.includes(ctx.path)) {
      return next()
    }
    let message_count = 0
    ctx.request.socket.setTimeout(0)
    ctx.req.socket.setNoDelay(true)
    ctx.req.socket.setKeepAlive(false)
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    const stream = new PassThrough()
    ctx.send = function (sendData) {
      stream.write('id: ' + message_count + '\n')
      stream.write('data: ' + JSON.stringify(sendData) + '\n\n')
      message_count += 1
    }
    ctx.sendEnd = function () {
      stream.destroy()
    }
    await next()
    ctx.status = 200
    ctx.body = stream
  }
}

export default sse
