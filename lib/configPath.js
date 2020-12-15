
const path = require('path')
const os = require('os')
const configSavePath = path.join(os.homedir(), '.hlink')
const mapJson = path.join(configSavePath, 'source_dest_map.json')

module.exports = {
  configSavePath,
  mapJson
}
