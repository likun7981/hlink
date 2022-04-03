import fs from 'fs-extra'
import path from 'path'
import { hlinkHomeDir } from '../paths.js'

class Config<T extends Array<any> | Record<string, any>> {
  private jsonPath: string
  private saveDir: string
  private defaultValue: T
  private cacheRead?: T
  private timeoutHandle?: NodeJS.Timeout
  constructor(defaultValue: T, filename: string = '', saveDir: string = '') {
    if (saveDir && !path.isAbsolute(saveDir)) {
      saveDir = path.join(hlinkHomeDir, saveDir)
    } else {
      saveDir = hlinkHomeDir
    }
    this.jsonPath = path.isAbsolute(filename)
      ? filename
      : path.join(saveDir, filename)
    this.saveDir = saveDir
    this.defaultValue = defaultValue
  }
  getSaveDir() {
    if (!fs.existsSync(this.saveDir)) {
      fs.ensureDirSync(this.saveDir)
    }
    return this.saveDir
  }
  write(content: T, filename?: string) {
    const saveDir = this.saveDir
    const jsonPath = filename
      ? path.join(this.saveDir, filename)
      : this.jsonPath
    if (!fs.existsSync(saveDir)) {
      fs.ensureDirSync(saveDir)
    }
    this.cacheRead = content
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }
    this.timeoutHandle = setTimeout(() => {
      this.cacheRead = undefined
      fs.writeJSONSync(jsonPath, content, {
        spaces: 2
      })
    }, 20)
  }

  read(filename?: string): T {
    const mapJson = filename ? path.join(this.saveDir, filename) : this.jsonPath
    if (!fs.existsSync(mapJson)) {
      this.write(this.defaultValue)
      return this.defaultValue
    }
    if (this.cacheRead) {
      return this.cacheRead
    }
    this.cacheRead = fs.readJSONSync(mapJson)
    return fs.readJSONSync(mapJson)
  }
}

export default Config
