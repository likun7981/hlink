import path from 'path'
import os from 'os'
import fs from 'fs-extra'

export const configSaveDir = path.join(os.homedir(), '.hlink')
const mapJson = path.join(configSaveDir, 'source_dest_map.json')
export const configName = 'hlink.config.js'
export const configPath = path.join(os.homedir(), configName)

export function writeSaveRecord(content: Record<string, any>) {
  if (!fs.existsSync(configSaveDir)) {
    fs.ensureDirSync(configSaveDir)
  }
  fs.writeJSONSync(mapJson, content)
}

export function readSaveRecord() {
  if (!fs.existsSync(mapJson)) {
    writeSaveRecord({})
    return {}
  }
  return fs.readJSONSync(mapJson)
}
