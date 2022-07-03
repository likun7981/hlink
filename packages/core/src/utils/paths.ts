import path from 'path'
import os from 'os'

const homedir = process.env.HLINK_HOME || os.homedir()
export const hlinkHomeDir =
  process.env.NODE_ENV === 'development'
    ? process.cwd()
    : path.join(homedir, '.hlink')

export const configName = 'hlink.config.mjs'
export const configPath = path.join(homedir, configName)
export const cachePath = path.join(hlinkHomeDir, 'cache-array.json')
