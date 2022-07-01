import { Middleware } from '../kit/base.js'

const formatBody: Middleware = async (ctx, next) => {
  try {
    await next()
    // stream not format
    if (ctx.response.headers['content-type'] === 'text/event-stream') {
      return
    }
    if (ctx.status === 200) {
      ctx.body = {
        success: true,
        data: ctx.body,
      }
    } else {
      throw new Error(`${ctx.status} ${ctx.message}`)
    }
  } catch (e) {
    ctx.body = {
      success: false,
      errorMessage: e.message,
    }
  }
}

export default formatBody
