import { PassThrough } from 'node:stream'
import { Middleware } from '../kit/base.js'

function sse(paths?: string[]): Middleware {
  return async function sse(ctx, next) {
    if (paths && !paths.includes(ctx.path)) {
      return next()
    }
    if (ctx.query.alive === '0') {
      await next()
      ctx.body = true
    } else {
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
      stream.on('close', () => {
        setTimeout(() => {
          ctx.res.end()
        }, 20)
      })
      ctx.send = async function (sendData) {
        if (ctx.res.writable) {
          stream.write('id: ' + message_count + '\n')
          stream.write('data: ' + JSON.stringify(sendData) + '\n\n')
        }
        // 兼容compress
        if (
          typeof ctx.body?.flush === 'function' &&
          ctx.body.flush.name !== 'deprecated'
        ) {
          ctx.body.flush()
        }
        message_count += 1
        return Promise.resolve(true)
      }
      ctx.sendEnd = function () {
        stream.end()
      }
      await next()
      ctx.status = 200
      ctx.body = stream
    }
  }
}

export default sse
