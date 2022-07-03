import { Koa } from './kit/base.js'
import formatResponse from './middleware/formatResponse.js'
import time from './middleware/time.js'
import serve from 'koa-static'
import router from './router.js'
import __dirname from './kit/__dirname.js'
import compress from 'koa-compress'
import path from 'node:path'
import { checkPathExist, log } from '@hlink/core'
import { internalIpV4 } from 'internal-ip'
import exitHook from 'exit-hook'
import { cancelAllSchedule } from './kit/schedule.js'
import fs from 'fs-extra'
import nodeSchedule from 'node-schedule'
import paths from './kit/paths.js'

const app = new Koa()

const port = process.env.PORT || 9090

// 每7天清理一下log
let cleanLogTask: nodeSchedule.Job
if (process.env.DOCKER !== 'true') {
  cleanLogTask = nodeSchedule.scheduleJob('0 0 * * 0', async () => {
    if (await checkPathExist(paths.logFile)) {
      fs.rm(paths.logFile)
    }
  })
}

exitHook(() => {
  cancelAllSchedule()
  if (cleanLogTask) {
    cleanLogTask.cancel()
  }
})

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

app.listen(process.env.PORT || 9090, async () => {
  const ip = await internalIpV4().catch(() => 'localhost')
  log.success('hlink serve started', `http://${ip}:${port}`)
})
