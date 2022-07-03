import { hlinkHomeDir, log } from '@hlink/core'
import path from 'node:path'
import fs from 'fs-extra'
import startup from 'user-startup'
import __dirname from './kit/__dirname.js'
import { internalIpV4 } from 'internal-ip'
import paths from './kit/paths.js'
import start from './index.js'

const file = path.join(hlinkHomeDir, 'startup')
const serverFile = path.join(__dirname(import.meta.url), 'start.js')

const startApp = async () => {
  if (process.env.DOCKER === 'true') {
    start()
  } else {
    const port = process.env.PORT || 9090
    const startupFile = startup.getFile('hlink')
    startup.create('hlink', process.execPath, [serverFile], paths.logFile)
    fs.ensureDirSync(hlinkHomeDir)
    fs.writeFileSync(file, startupFile)
    const ip = await internalIpV4().catch(() => 'localhost')
    log.success('hlink serve started', `http://${ip}:${port}`)
  }
}

const stopApp = () => {
  startup.remove('hlink')
  log.info('hlink serve stopped')
}

const server = {
  start: startApp,
  stop: stopApp,
}

export default server
