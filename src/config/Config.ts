import { execaSync } from 'execa'
import fs from 'fs-extra'
import path from 'path'
import { hlinkHomeDir } from '../paths.js'

class Config<T extends Array<any> | Record<string, any>> {
  private jsonPath: string
  private backupPath: string
  private saveDir: string
  private defaultValue: T
  private cacheRead?: T
  private timeoutHandle?: NodeJS.Timeout
  constructor(filename: string, defaultValue: T, saveDir?: string) {
    saveDir = saveDir || hlinkHomeDir
    if (process.env.NODE_ENV === 'development') {
      saveDir = path.resolve('hlink')
    }
    this.jsonPath = path.join(saveDir, filename)
    this.backupPath = this.jsonPath + '_backup'
    this.saveDir = saveDir
    this.defaultValue = defaultValue
  }
  write(content: T) {
    const saveDir = this.saveDir
    if (!fs.existsSync(saveDir)) {
      fs.ensureDirSync(saveDir)
    }
    this.cacheRead = content
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }
    this.timeoutHandle = setTimeout(() => {
      this.cacheRead = undefined
      fs.writeJSONSync(this.jsonPath, content, {
        spaces: 0
      })
    }, 20)
  }

  read(): T {
    const mapJson = this.jsonPath
    if (!fs.existsSync(this.jsonPath)) {
      this.write(this.defaultValue)
      return this.defaultValue
    }
    if (this.cacheRead) {
      return this.cacheRead
    }
    this.cacheRead = fs.readJSONSync(mapJson)
    return fs.readJSONSync(mapJson)
  }

  backup() {
    if (!this.exist(true) && this.exist()) {
      try {
        execaSync('cp', [this.jsonPath, this.backupPath])
        this.rm()
      } catch (e) {}
    }
  }

  restore() {
    if (this.exist(true) && !this.exist()) {
      try {
        execaSync('cp', [this.backupPath, this.jsonPath])
        this.rm(true)
      } catch (e) {}
    }
  }

  exist(backup: boolean = false): boolean {
    try {
      return fs.existsSync(backup ? this.backupPath : this.jsonPath)
    } catch (e) {
      return false
    }
  }

  rm(backup: boolean = false) {
    if (this.exist(backup)) {
      execaSync('rm', [backup ? this.backupPath : this.jsonPath])
    }
  }
}

export default Config
