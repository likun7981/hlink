import { PassThrough } from 'node:stream'
import { Middleware } from '../kit/base.js'

function sse(paths?: string[]): Middleware {
  return function sse(ctx, next) {
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
      // "Connection": "keep-alive",
    })
    ctx.status = 200
    const stream = new PassThrough()
    ctx.json = function (obj: Record<string, string>, type?: string) {
      stream.write('id: ' + message_count + '\n')
      if ('string' === typeof type) {
        stream.write('event: ' + type + '\n')
      }
      stream.write('data: ' + JSON.stringify(obj) + '\n\n')
      message_count += 1
    }
    ctx.body = stream
    ctx.jsonEnd = function () {
      stream.destroy()
    }
    next()
  }
}

export default sse
