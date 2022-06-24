import path from 'node:path'
import fs from 'fs-extra'
import { hlinkHomeDir, config, checkPathExist } from '@hlink/core'
import { TConfig } from '../../types/shim'

class ConfigSDK {
  private baseDir: string
  constructor(baseDir = hlinkHomeDir) {
    if (process.env.NODE_ENV === 'development') {
      baseDir = process.cwd()
    }
    this.baseDir = path.join(baseDir, 'configs')
  }

  private getConfigId(name: string, description?: string) {
    if (!name) {
      throw new Error('必须指定名称')
    }
    return `${name}-${description || name}`
  }

  private getConfigPath(name: string, description?: string) {
    return path.join(this.baseDir, `${this.getConfigId(name, description)}.mjs`)
  }

  async add(c: TConfig) {
    if (await this.exist(c.name)) {
      throw new Error(`配置 ${c.name} 已存在`)
    }
    return config.create(
      this.baseDir,
      this.getConfigId(c.name, c.description),
      c.detail
    )
  }

  async update(prevName: string, preDescription: string, c: TConfig) {
    if (!prevName) {
      throw new Error('必须指定修改前的文件名称')
    }
    if (!(await checkPathExist(this.getConfigPath(prevName, preDescription)))) {
      throw new Error(`配置 ${prevName} 不存在`)
    }
    let configPath = this.getConfigPath(prevName, preDescription)
    if (c.name !== prevName || c.description !== preDescription) {
      const oldPath = configPath
      configPath = this.getConfigPath(c.name, c.description)
      await fs.rename(oldPath, configPath)
    }
    return config.update(configPath, c.detail)
  }

  remove(name: string, description?: string) {
    return fs.rm(this.getConfigPath(name, description))
  }

  async get(name: string, description?: string) {
    return (await fs.readFile(this.getConfigPath(name, description))).toString()
  }

  async getOpt(name: string, description?: string) {
    return config.get(this.getConfigPath(name, description))
  }

  default() {
    return config.getDefaultStr()
  }

  async exist(name: string) {
    const files = await this.getList()
    return files.find((file) => file.indexOf(`${name}-`) === 0)
  }

  async getList() {
    const list = fs.readdir(this.baseDir)
    return list
  }
}

export default ConfigSDK
