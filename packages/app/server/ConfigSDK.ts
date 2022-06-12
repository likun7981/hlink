import os from 'os'
import path from 'path'
import { TConfig } from '../types/shim'

const defaultBaseDir = path.join(os.homedir(), '.hlink')

class ConfigSDK {
  private baseDir: string
  constructor(baseDir = defaultBaseDir) {
    this.baseDir = path.join(baseDir, 'configs')
  }

  add(config: TConfig) {
    if (path) {
      console.log(111)
    }
  }
}

export default ConfigSDK
