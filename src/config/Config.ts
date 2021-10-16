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
    const saveDir = this.saveDir;
    if (!fs.existsSync(saveDir)) {
      fs.ensureDirSync(saveDir)
    }
    fs.writeJSONSync(this.jsonPath, content, {
      spaces: 2
    })
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
