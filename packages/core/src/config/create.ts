import { chalk, checkPathExist, log, warning } from '../utils/index.js'
import path from 'node:path'
import { configName } from '../utils/paths.js'
import fs from 'fs-extra'
import getDefaultStr from './getDefaultStr.js'

async function create(configDir: string, name?: string, detail?: string) {
  warning(!configDir, '必须指定配置文件')
  const configPath = path.join(configDir, name ? name : configName)
  if (await checkPathExist(configPath)) {
    warning(true, `配置文件已存在 ${chalk.cyan(configPath)} 请勿重复创建`)
  }
  try {
    await fs.ensureDir(path.dirname(configPath))
    const content = detail || (await getDefaultStr())
    await fs.writeFile(configPath, content)
    log.success('配置文件创建成功, 路径为', chalk.cyan(configPath))
    console.log()
  } catch (e) {
    log.error('配置文件创建失败', e)
  }
}

export default create
