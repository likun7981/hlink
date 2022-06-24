import path from 'node:path'
import fs from 'fs-extra'
import { hlinkHomeDir, checkPathExist } from '@hlink/core'
import { TTask } from '../../types/shim'

class TaskSDK {
  private baseDir: string
  constructor(baseDir = hlinkHomeDir) {
    if (process.env.NODE_ENV === 'development') {
      baseDir = process.cwd()
    }
    this.baseDir = path.join(baseDir, 'tasks')
  }

  private getTaskPath(name: string) {
    if (!name) {
      throw new Error('必须指定名称')
    }
    return path.join(this.baseDir, `${name}.json`)
  }

  async add(c: TTask) {
    if (await this.exist(c.name)) {
      throw new Error(`任务 ${c.name} 已存在`)
    }

    return fs.writeJSON(this.getTaskPath(c.name), c)
  }

  async update(prevName: string, c: TTask) {
    if (!prevName) {
      throw new Error('必须指定修改前的文件名称')
    }
    if (!(await checkPathExist(this.getTaskPath(prevName)))) {
      throw new Error(`任务 ${prevName} 不存在`)
    }
    let taskPath = this.getTaskPath(prevName)
    if (c.name !== prevName) {
      const oldPath = taskPath
      taskPath = this.getTaskPath(c.name)
      await fs.rename(oldPath, taskPath)
    }
    return fs.writeJSON(taskPath, c)
  }

  async remove(name: string) {
    return fs.rm(this.getTaskPath(name))
  }

  async get(name: string) {
    return (await fs.readJSON(this.getTaskPath(name))) as TTask
  }

  async exist(name: string) {
    return checkPathExist(this.getTaskPath(name))
  }

  async getList() {
    if (!(await checkPathExist(this.baseDir))) {
      await fs.ensureDir(this.baseDir)
    }
    const list = (await fs.readdir(this.baseDir)).map((nameWithExt) => {
      return nameWithExt.replace(path.extname(nameWithExt), '')
    })
    console.log(list)
    return list
  }
}

export default TaskSDK
