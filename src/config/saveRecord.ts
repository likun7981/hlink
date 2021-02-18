import fs from 'fs-extra'
import { log } from '../utils'
import { mapJson, configSaveDir } from './paths'

function saveRecord(source: string, dest: string, isDelete: boolean) {
  try {
    fs.ensureDirSync(configSaveDir)
    let savedPath: Record<string, any> = {}
    if (fs.existsSync(mapJson)) {
      savedPath = fs.readJSONSync(mapJson)
    }
    const savedDestPath: Array<string> = savedPath[source]
    if (savedDestPath) {
      if (savedDestPath.indexOf(dest) !== -1) {
        if (isDelete) {
          savedPath[source] = savedDestPath.filter(s => s !== dest)
        }
        if (!savedPath[source].length) {
          delete savedPath[source]
        }
      } else {
        savedPath[source] = savedDestPath.concat(dest)
      }
    } else {
      savedPath[source] = [dest]
    }
    fs.writeJSONSync(mapJson, savedPath)
  } catch (e) {
    log.error(e.message)
  }
}

export default saveRecord
