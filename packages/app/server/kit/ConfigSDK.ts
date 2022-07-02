import path from 'node:path'
import fs from 'fs-extra'
import { hlinkHomeDir, config } from '@hlink/core'
import { TConfig } from '../../types/shim'
import BaseSDK from './BaseSDK.js'

class ConfigSDK extends BaseSDK<'configs'> {
  private baseDir: string
  constructor(baseDir = hlinkHomeDir) {
    super('configs')
    this.baseDir = path.join(baseDir, 'configs')
  }

  getConfig(c: TConfig) {
    return {
      name: c.name,
      description: c.description,
      configPath: path.join(
        this.baseDir,
        `${this.db.createId('').value()}.mjs`
      ),
    }
  }

  async add(c: TConfig) {
    if (this.exist(c.name)) {
      throw new Error(`配置 ${c.name} 已存在`)
    }
    const item = this.db.insert(this.getConfig(c)).value()
    await this.write()
    await config.create(this.baseDir, path.basename(item.configPath), c.detail)
    return true
  }

  async update(prevName: string, c: TConfig) {
    if (!this.exist(prevName)) {
      throw new Error(`配置 ${prevName} 不存在`)
    }
    let currentPath = this.db.getById(prevName).value().configPath
    const updateItem: TConfig = {
      configPath: currentPath,
      name: c.name,
      description: c.description,
    }
    if (prevName !== c.name) {
      if (this.exist(c.name)) {
        throw new Error(`配置 ${c.name} 已存在`)
      }
      this.db.removeById(prevName).value()
      this.db.insert(updateItem).value()
    } else {
      this.db.upsert(updateItem).value()
    }
    await this.write()
    if (c.detail) {
      await config.update(currentPath, c.detail)
    }
    return true
  }

  async remove(name: string) {
    if (!this.exist(name)) {
      throw new Error(`配置 ${name} 不存在`)
    }
    const removeItem = this.db.removeById(name).value()
    await this.write()
    await fs.rm(removeItem.configPath)
    return true
  }

  async get(name: string): Promise<TConfig> {
    if (!this.exist(name)) {
      throw new Error(`配置 ${name} 不存在`)
    }
    const obj = this.db.getById(name).value()
    return {
      ...obj,
      detail: (await fs.readFile(obj.configPath)).toString(),
    }
  }

  async getOpt(name: string) {
    if (!this.exist(name)) {
      throw new Error(`配置 ${name} 不存在`)
    }
    return config.get(this.db.getById(name).value().configPath)
  }

  default() {
    return config.getDefaultStr()
  }

  exist(name: string) {
    if (!name) {
      throw new Error('必须指定配置名称')
    }
    return !!this.db.getById(name).value()
  }

  async getList() {
    const list = this.db.value()
    return list
  }
}

export default new ConfigSDK()

export { ConfigSDK }
