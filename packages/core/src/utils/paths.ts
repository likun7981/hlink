import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import { checkPathExist } from './index.js'

const homedir = os.homedir()
export const hlinkHomeDir =
  process.env.HLINK_HOME ||
  (process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'hlink')
    : path.join(homedir, '.hlink'))

if (!(await checkPathExist(hlinkHomeDir))) {
  fs.ensureDir(hlinkHomeDir)
}

export const configName = 'hlink.config.mjs'
export const configPath = path.join(homedir, configName)
export const cachePath = path.join(hlinkHomeDir, 'cache-array.json')
