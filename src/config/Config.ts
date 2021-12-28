import fs from 'fs-extra'
import path from 'path'
import os from 'os'

class Config<T extends Array<string> | Record<string, any>> {
  private jsonPath: string
  constructor(
    jsonFilename: string,
    defaultValue: T,
    saveDir: string = path.join(os.homedir(), '.hlink')
  ) {
    if (!fs.existsSync(saveDir)) {
      fs.ensureDirSync(saveDir)
      this.write(defaultValue)
    }
    this.jsonPath = path.join(saveDir, jsonFilename)
  }
  write(content: T) {
    fs.writeJSONSync(this.jsonPath, content, {
      spaces: 2
    })
  }

  read(): T {
    const mapJson = this.jsonPath
    return fs.readJSONSync(mapJson)
  }
}

export default Config
