import { Middleware } from '../kit/base.js'

const formatBody: Middleware = async (ctx, next) => {
  if (ctx.path === '/api/task/run') {
    return next()
  }
  try {
    await next()
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
