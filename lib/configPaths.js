
const path = require('path')
const os = require('os')
const configSaveDir = path.join(os.homedir(), '.hlink')
const mapJson = path.join(configSaveDir, 'source_dest_map.json')
const configPath = path.join(os.homedir(), 'hlink.config.js')

module.exports = {
  configSaveDir,
  mapJson,
  configPath
}
