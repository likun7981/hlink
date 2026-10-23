import {
  chalk,
  alwaysLogWrapper,
  log,
  rmFiles,
  deleteEmptyDir,
  validateFileFilter,
  preview,
} from '@hlink/core'
import { SSELog, TSchedule, TTask } from '../../types/shim'
import BaseSDK from './BaseSDK.js'
import configSDK from './ConfigSDK.js'
import * as exec from './exec.js'
import createSchedule, {
  cancelSchedule,
  hasSchedule,
  renameSchedule,
} from './schedule.js'
import { main, prune } from '@hlink/core'

class TaskSDK extends BaseSDK<'tasks'> {
  constructor() {
    super('tasks')
  }
  async add(c: TTask) {
    validateFileFilter(c.fileFilter ?? undefined)
    if (this.exist(c.name)) {
      throw new Error(`任务 ${c.name} 已存在`)
    }
    this.db.insert(c).value()
    await this.write()
    return true
  }

  async update(prevName: string, c: TTask) {
    validateFileFilter(c.fileFilter ?? undefined)
    const task = this.get(prevName)
    if (!task) {
      throw new Error(`任务 ${prevName} 不存在`)
    }
    if (c.name !== prevName) {
      if (this.exist(c.name)) {
        throw new Error(`任务 ${c.name} 已存在`)
      }
      cancelSchedule(prevName)
      this.db.removeById(prevName).value()
      this.db
        .insert({
          ...task,
          ...c,
        })
        .value()
    } else {
      this.db
        .upsert({
          ...task,
          ...c,
        })
        .value()
    }
    await this.write()
    const updated = this.get(c.name)
    if (updated.scheduleType && updated.scheduleValue) {
      await this.createSchedule({
        name: updated.name,
        scheduleType: updated.scheduleType,
        scheduleValue: updated.scheduleValue,
      })
    }
    return true
  }

  async remove(name: string) {
    if (!this.exist(name)) {
      throw new Error(`任务 ${name} 不存在`)
    }
    if (await this.cancelSchedule(name)) {
      this.db.removeById(name).value()
      await this.write()
      return true
    }
    return false
  }

  get(name: string) {
    if (!this.exist(name)) {
      throw new Error(`任务 ${name} 不存在`)
    }
    return this.db.getById(name).value()
  }

  exist(name: string) {
    if (!name) {
      throw new Error('必须指定任务名称')
    }
    return !!this.db.getById(name).value()
  }

  getList() {
    const list = this.db.value()
    list.forEach((v) => {
      // 有计划任务则自动创建
      if (!!v.scheduleType && !!v.scheduleValue && !hasSchedule(v.name)) {
        this.createSchedule({
          name: v.name,
          scheduleType: v.scheduleType,
          scheduleValue: v.scheduleValue,
        })
      }
    })
    this.write()
    return this.db.value()
  }

  async resolveConfig(task: TTask) {
    const allConfig = await configSDK.getOpt(task.config)
    const fileFilter = task.fileFilter ?? allConfig.fileFilter
    validateFileFilter(fileFilter)
    let config
    if (task.type === 'main') {
      config = { ...allConfig, fileFilter }
    } else if (task.type === 'prune') {
      config = {
        withoutConfirm: false,
        pathsMapping: allConfig.pathsMapping,
        reverse: task.reverse,
        exclude: allConfig.exclude,
        include: allConfig.include,
        deleteDir: allConfig.deleteDir,
        fileFilter,
      }
    } else {
      throw new Error('未知的任务类型')
    }
    return {
      command: task.type,
      config,
    }
  }

  async getConfig(name: string) {
    return this.resolveConfig(this.get(name))
  }

  async preview(task: TTask) {
    if (task.type !== 'main') throw new Error('匹配预览仅支持硬链任务')
    const { config } = await this.resolveConfig(task)
    return preview(config)
  }

  async start(name: string) {
    const result = await this.getConfig(name)
    const currentMonitor = exec.start(name, result.command, {
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
    let currentMonitor = exec.get(name)
    if (currentMonitor) {
      log.send?.({
        output: alwaysLogWrapper.info(`任务 ${chalk.cyan(name)} 正在执行中..`),
        status: 'ongoing',
        type: result.command,
      })
    } else {
      currentMonitor = exec.start(name, result.command, result.config)
    }
    currentMonitor.handleLog((data) => {
      log.send?.({
        output: data,
        status: 'ongoing',
        type: result.command,
      })
    })
    currentMonitor.original
      .then(async () => {
        log.send?.({
          status: 'succeed',
          type: result.command,
          output: exec.getFiles(name)
            ? alwaysLogWrapper.warn(
                '请点击确认继续删除文件或者可以取消删除任务~'
              )
            : undefined,
          confirm: !!exec.getFiles(name),
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
        exec.clear(name)
        log.sendEnd?.()
      })
  }

  cancel(name: string) {
    return exec.cancel(name)
  }

  async confirmRemove(name: string, cancel = true) {
    if (cancel) {
      exec.clearFiles(name)
    } else {
      const deleteFiles = exec.getFiles(name)
      if (deleteFiles) {
        await rmFiles(deleteFiles)
        await deleteEmptyDir(deleteFiles)
      }
      exec.clearFiles(name)
    }
  }

  renameSchedule(preName: string, name: string) {
    if (renameSchedule(preName, name)) {
      return true
    }
    return false
  }

  async cancelSchedule(name: string, write = true) {
    const task = this.get(name)
    this.db
      .upsert({
        ...task,
        name,
        scheduleType: undefined,
        scheduleValue: undefined,
      })
      .value()
    if (cancelSchedule(name)) {
      if (write) {
        await this.write()
      }
      return true
    }
    return false
  }

  async createSchedule(option: TSchedule) {
    const { name, scheduleType, scheduleValue } = option
    const task = this.get(option.name)
    this.db
      .upsert({
        ...task,
        name,
        scheduleType,
        scheduleValue,
      })
      .value()
    await this.getConfig(name)
    const startTask = async () => {
      const taskConfig = await this.getConfig(name)
      if (taskConfig.command === 'prune') {
        await prune({
          ...taskConfig.config,
          withoutConfirm: true,
        })
      } else if (taskConfig.command === 'main') {
        await main(taskConfig.config)
      } else {
        throw new Error('未知命令!')
      }
      console.log()
    }
    if (createSchedule(option, startTask)) {
      await this.write()
      return true
    }
    return false
  }
}

export default new TaskSDK()
