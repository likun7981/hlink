import os from 'os'
import path from 'path'
import { hlinkHomeDir } from '@hlink/core'
import { TConfig } from '../types/shim'

class ConfigSDK {
  private baseDir: string
  constructor(baseDir = hlinkHomeDir) {
    this.baseDir = path.join(baseDir, 'configs')
  }

  add(config: TConfig) {
    if (path) {
      console.log(111)
    }
  }
}

export default ConfigSDK
