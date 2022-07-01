import { main, prune, TAllConfig } from '@hlink/core'
import { TTask } from '../../types/shim'
import BaseSDK from './BaseSDK.js'
import configSDK from './ConfigSDK.js'
import start, { ReturnType } from './exec.js'

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
    const task = this.db.getById(name).value()
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
}

export default new TaskSDK()
