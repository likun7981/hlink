import path from 'path'
import os from 'os'
import Config from './config/Config.js'

export const hlinkHomeDir = path.join(os.homedir(), '.hlink')

export const configName = 'hlink.config.mjs'
export const configPath = path.join(os.homedir(), configName)
export const cachePath = path.join(hlinkHomeDir, 'cache-array.json')

export const cacheRecord = new Config<Array<string>>('cache-array.json', [])

export type RecordType = { source: string[]; dest: string[], inode: string }
export const fileRecord = new Config<RecordType[]>('files.json', [])
