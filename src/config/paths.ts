import path from 'path'
import os from 'os'
import Config from './Config';

export const configSaveDir = path.join(os.homedir(), '.hlink')
export const configName = 'hlink.config.js'
export const configPath = path.join(os.homedir(), configName)
export const cachePath = path.join(configSaveDir, 'cache.json');

export const deleteConfig = new Config('source_dest_map.json')

export const cacheConfig = new Config('cache.json')
