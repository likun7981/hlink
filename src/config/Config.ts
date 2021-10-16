import fs from 'fs-extra'
import path from 'path'
import os from 'os';

class Config {
  saveDir: string;
  jsonPath: string;
  constructor(jsonFilename: string, saveDir: string = path.join(os.homedir(), '.hlink')) {
    this.saveDir = saveDir;
    this.jsonPath = path.join(saveDir, jsonFilename);
  }
  write(content: Record<string, any>) {
    const configSaveDir = this.saveDir;
    if (!fs.existsSync(configSaveDir)) {
      fs.ensureDirSync(configSaveDir)
    }
    fs.writeJSONSync(this.jsonPath, content)
  }

  read() {
    const mapJson = this.jsonPath;
    if (!fs.existsSync(mapJson)) {
      this.write({})
      return {}
    }
    return fs.readJSONSync(mapJson)
  }
}

export default Config;
