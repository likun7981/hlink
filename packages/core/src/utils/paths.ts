import path from 'path'
import os from 'os'

export const hlinkHomeDir =
  process.env.NODE_ENV === 'development'
    ? process.cwd()
    : path.join(os.homedir(), '.hlink')

export const configName = 'hlink.config.mjs'
export const configPath = path.join(os.homedir(), configName)
export const cachePath = path.join(hlinkHomeDir, 'cache-array.json')
