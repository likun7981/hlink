import {
  chalk,
  alwaysLogWrapper,
  log,
  rmFiles,
  deleteEmptyDir,
} from '@hlink/core'
import { SSELog, TTask } from '../../types/shim'
import BaseSDK from './BaseSDK.js'
import configSDK from './ConfigSDK.js'
import start from './exec.js'
import { cancelSchedule, schedule } from './schedule.js'

const ongoingTasks: Partial<Record<string, ReturnType<typeof start> | null>> =
  {}

const waitingDeleteFiles: Partial<Record<string, string[] | null>> = {}

class TaskSDK extends BaseSDK<'tasks'> {
  constructor() {
    super('tasks')
  }
  async add(c: TTask) {
    if (await this.exist(c.name)) {
      throw new Error(`任务 ${c.name} 已存在`)
    }
    this.db.insert(c).value()
    await this.write()
    return true
  }

  async update(prevName: string, c: TTask) {
    if (!(await this.exist(prevName))) {
      throw new Error(`任务 ${prevName} 不存在`)
    }
    if (c.name !== prevName) {
      if (await this.exist(c.name)) {
        throw new Error(`任务 ${prevName} 已存在`)
      }
      this.db.removeById(prevName).value()
      this.db.insert(c).value()
    } else {
      this.db.upsert(c).value()
    }
    await this.write()
    return true
  }

  async remove(name: string) {
    if (!(await this.exist(name))) {
      throw new Error(`任务 ${name} 不存在`)
    }
    this.db.removeById(name).value()
    await this.write()
    return true
  }

  async get(name: string) {
    if (!(await this.exist(name))) {
      throw new Error(`任务 ${name} 不存在`)
    }
    return this.db.getById(name).value()
  }

  async exist(name: string) {
    if (!name) {
      throw new Error('必须指定任务名称')
    }
    return !!this.db.getById(name).value()
  }

  async getList() {
    return this.db.value()
  }

  async getConfig(name: string) {
    const task = await this.get(name)
    const allConfig = await configSDK.getOpt(task.config)
    let config
    if (task.type === 'main') {
      config = allConfig
    } else if (task.type === 'prune') {
      config = {
        withoutConfirm: false,
        pathsMapping: allConfig.pathsMapping,
        reverse: task.reverse,
        exclude: allConfig.exclude,
        include: allConfig.include,
        deleteDir: allConfig.deleteDir,
      }
    } else {
      throw new Error('未知的任务类型')
    }
    return {
      command: task.type,
      config,
    }
  }

  async start(name: string) {
    const result = await this.getConfig(name)
    const currentMonitor = start(result.command, {
      ...result.config,
      usedBy: 'terminal',
    })
    currentMonitor.handleLog((d) => {
      log.error('任务执行出错', name)
      console.log(d)
    })
    return currentMonitor.original
  }
  async run(name: string, log: SSELog) {
    const result = await this.getConfig(name)
    let currentMonitor = ongoingTasks[name]
    if (currentMonitor) {
      log.send?.({
        output: alwaysLogWrapper.info(`任务 ${chalk.cyan(name)} 正在执行中..`),
        status: 'ongoing',
        type: result.command,
      })
    } else {
      currentMonitor = start(result.command, result.config)
    }
    ongoingTasks[name] = currentMonitor
    currentMonitor.handleLog((data) => {
      log.send?.({
        output: data,
        status: 'ongoing',
        type: result.command,
      })
    })
    // 接受prune传来的文件
    currentMonitor.original.on('message', (r) => {
      const files = r as string[]
      if (files.length) {
        waitingDeleteFiles[name] = r as string[]
      }
    })
    currentMonitor.original
      .then(async () => {
        log.send?.({
          status: 'succeed',
          type: result.command,
          output: waitingDeleteFiles[name]
            ? alwaysLogWrapper.warn(
                '请点击确认继续删除文件或者可以取消删除任务~'
              )
            : undefined,
          confirm: !!waitingDeleteFiles[name],
        })
      })
      .catch((e) => {
        console.log(e)
        if (e.killed) {
          return log.send?.({
            status: 'failed',
            type: result.command,
            output: alwaysLogWrapper.warn('已手动取消'),
          })
        } else {
          return log.send?.({
            status: 'failed',
            type: result.command,
            output: alwaysLogWrapper.error('任务执行出错，已终止'),
          })
        }
      })
      .then(() => {
        ongoingTasks[name] = null
        log.sendEnd?.()
      })
  }

  async cancel(name: string) {
    const ongoingTask = ongoingTasks[name]
    if (ongoingTask) {
      if (ongoingTask.kill()) {
        ongoingTasks[name] = null
      }
    } else {
      throw new Error('没有进行中的任务')
    }
  }

  async confirmRemove(name: string, cancel = true) {
    if (cancel) {
      waitingDeleteFiles[name] = null
    } else {
      const deleteFiles = waitingDeleteFiles[name]
      if (deleteFiles) {
        await rmFiles(deleteFiles)
        await deleteEmptyDir(deleteFiles)
      }
      waitingDeleteFiles[name] = null
    }
  }

  async schedule(
    name: string,
    scheduleType: TTask['scheduleType'],
    scheduleValue: TTask['scheduleValue']
  ) {
    const task = await this.get(name)
    this.db
      .upsert({
        ...task,
        name,
        scheduleType,
        scheduleValue,
      })
      .value()
    await cancelSchedule(name)
    await schedule(name, scheduleType, scheduleValue)
    this.write()
  }
}

export default new TaskSDK()
