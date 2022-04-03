import fs from 'fs-extra'
import path from 'path'
import os from 'os'

class Config<T extends Array<any> | Record<string, any>> {
  private jsonPath: string
  private saveDir: string
  private defaultValue: T
  private cacheRead?: T
  private timeoutHandle?: NodeJS.Timeout
  constructor(filename: string, defaultValue: T, saveDir?: string) {
    saveDir = saveDir || path.join(os.homedir(), '.hlink')
    this.jsonPath = path.join(saveDir, filename)
    this.saveDir = saveDir
    this.defaultValue = defaultValue
  }
  write(content: T) {
    const saveDir = this.saveDir
    if (!fs.existsSync(saveDir)) {
      fs.ensureDirSync(saveDir)
    }
    this.cacheRead = content
    if(this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }
    this.timeoutHandle = setTimeout(() => {
      this.cacheRead = undefined
      fs.writeJSONSync(this.jsonPath, content, {
        spaces: 2
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
}

export default Config
