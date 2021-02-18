import path from 'path'
import os from 'os'

export const configSaveDir = path.join(os.homedir(), '.hlink')
export const mapJson = path.join(configSaveDir, 'source_dest_map.json')
export const configPath = path.join(os.homedir(), 'hlink.config.js')
