const fs = require('fs-extra')
const { mapJson, configSavePath } = require('./configPath')

function saveSourceAndDest (source, dest, isDelete) {
  try {
    fs.ensureDirSync(configSavePath)
    let savedPath = {}
    if (fs.existsSync(mapJson)) {
      savedPath = fs.readJSONSync(mapJson)
    }
    const savedDestPath = savedPath[source]
    if (savedDestPath) {
      if (savedDestPath.indexOf(dest) !== -1) {
        if (isDelete) {
          savedPath[source] = savedDestPath.filter((s) => s !== dest)
        }
        if (!savedPath[source].length) {
          delete savedPath[source]
        }
      } else {
        savedPath[source] = saveSourceAndDest.concat(dest)
      }
    } else {
      savedPath[source] = [dest]
    }
    fs.writeJSONSync(mapJson, savedPath)
  } catch (e) {
    console.log(e)
  }
}

module.exports = saveSourceAndDest
