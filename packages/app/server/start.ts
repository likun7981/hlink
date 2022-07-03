import { checkPathExist } from '@hlink/core'
import exitHook from 'exit-hook'
import { cancelAllSchedule } from './kit/schedule.js'
import fs from 'fs-extra'
import nodeSchedule from 'node-schedule'
import paths from './kit/paths.js'
import startApp from './index.js'

// 每7天清理一下log
const cleanLogTask = nodeSchedule.scheduleJob('0 0 * * 0', async () => {
  if (await checkPathExist(paths.logFile)) {
    fs.rm(paths.logFile)
  }
})

exitHook(() => {
  cancelAllSchedule()
  if (cleanLogTask) {
    cleanLogTask.cancel()
  }
})

startApp()
