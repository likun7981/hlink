import { log, chalk } from '@hlink/core'
import { Middleware } from '../kit/base.js'

const time: Middleware = async (ctx, next) => {
  const start = Date.now()

  return next().then(() => {
    log.info(
      chalk.gray(ctx.originalUrl),
      ctx.request.method,
      ctx.status,
      '耗时',
      Date.now() - start,
      'ms'
    )
  })
}

export default time
