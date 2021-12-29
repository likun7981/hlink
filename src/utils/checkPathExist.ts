import chalk from 'chalk'
import { stat } from 'fs-extra'
import { log } from './index'

async function checkPathExist(path: string) {
  try {
    await stat(path)
  } catch (e) {
    console.log(e)
    log.error('无法访问路径', chalk.cyan(path))
    process.exit(0)
  }
}

export default checkPathExist
