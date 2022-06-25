import { TTask } from '../../types/shim'
import BaseSDK from './BaseSDK.js'

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
}

export default TaskSDK
