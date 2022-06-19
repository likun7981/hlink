import { log } from '@hlink/core'
import chalk from 'chalk'
import { Middleware } from '../kit/base.js'

const time: Middleware = async (ctx, next) => {
  const start = Date.now()

  return next().then(() => {
    log.info(
      chalk.gray(ctx.originalUrl),
      ctx.status,
      '耗时',
      Date.now() - start,
      'ms'
    )
  })
}

export default time
