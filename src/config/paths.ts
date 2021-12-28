import path from 'path'
import os from 'os'
import Config from './Config'

export const hlinkHomeDir = path.join(os.homedir(), '.hlink')

export const configName = 'hlink.config.js'
export const configPath = path.join(os.homedir(), configName)
export const cachePath = path.join(hlinkHomeDir, 'cache-array.json')

export const deleteConfig = new Config<Record<string, string[]>>('cacheForDelete.json', {})

export const cacheConfig = new Config<Array<string>>('cache-array.json', [])
