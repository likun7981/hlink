import { log } from '@hlink/core'
import schedule from 'node-schedule'
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import { TSchedule } from '../../types/shim'
import TaskSDK from './TaskSDK.js'

const schedules: Partial<Record<string, (() => void) | null>> = {}
function createSchedule(options: TSchedule, runTask: () => void) {
  cancelSchedule(options.name)
  let cancel: (() => boolean) | undefined
  log.success(
    `计划任务${options.name}已开启：${options.scheduleType} | ${options.scheduleValue}`
  )
  if (options.scheduleType === 'cron') {
    const cronJob = schedule.scheduleJob(options.scheduleValue, function () {
      runTask()
    })
    cancel = () => cronJob.cancel()
  } else if (options.scheduleType === 'loop') {
    const scheduler = new ToadScheduler()
    const task = new Task(options.name, async () => {
      runTask()
    })
    const job = new SimpleIntervalJob(
      { seconds: Number(options.scheduleValue), runImmediately: true },
      task,
      options.name
    )
    scheduler.addSimpleIntervalJob(job)
    cancel = () => {
      scheduler.stopById(options.name)
      scheduler.removeById(options.name)
      return true
    }
  } else {
    throw new Error('未知计划任务类型!')
  }
  schedules[options.name] = cancel
  return true
}

export function cancelSchedule(name: string) {
  const shouldCancel = schedules[name]
  if (shouldCancel) {
    shouldCancel()
    schedules[name] = null
  }
  log.success(`已取消计划任务 ${name}`)
  return true
}
export function renameSchedule(preName: string, name: string) {
  if (schedules[preName]) {
    schedules[name] = schedules[preName]
    schedules[preName] = null
  }
  return true
}

export function cancelAllSchedule() {
  Object.keys(schedules).forEach((name) => {
    TaskSDK.cancelSchedule(name)
  })
}

export function hasSchedule(name: string) {
  return !!schedules[name]
}

export default createSchedule
