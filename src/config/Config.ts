import fs from 'fs-extra'
import path from 'path'
import os from 'os'

class Config<T extends Array<string> | Record<string, any>> {
  private jsonPath: string
  private saveDir: string
  private defaultValue: T
  constructor(
    jsonFilename: string,
    defaultValue: T,
    saveDir: string = path.join(os.homedir(), '.hlink')
  ) {
    this.jsonPath = path.join(saveDir, jsonFilename)
    this.saveDir = saveDir
    this.defaultValue = defaultValue
  }
  write(content: T) {
    const saveDir = this.saveDir
    if (!fs.existsSync(saveDir)) {
      fs.ensureDirSync(saveDir)
    }
    fs.writeJSONSync(this.jsonPath, content, {
      spaces: 2
    })
  }

  read(): T {
    const mapJson = this.jsonPath
    if (!fs.existsSync(this.jsonPath)) {
      this.write(this.defaultValue)
      return this.defaultValue
    }
    return fs.readJSONSync(mapJson)
  }
}

export default Config
