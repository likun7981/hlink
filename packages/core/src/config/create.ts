import { checkPathExist, log, warning } from '../utils/index.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configName } from '../utils/paths.js'
import chalk from 'chalk'
import fs from 'fs-extra'

async function create(configDir: string) {
  warning(!configDir, '必须指定配置文件')
  const configPath = path.join(configDir, configName)
  if (await checkPathExist(configPath)) {
    warning(true, `配置文件已存在 ${chalk.cyan(configPath)} 请勿重复创建`)
  }
  try {
    await fs.ensureDir(path.dirname(configPath))
    const content = await fs.readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'hlink.config.tpl'
      )
    )
    await fs.writeFile(configPath, content)
    log.success('配置文件创建成功, 路径为', chalk.cyan(configPath))
    console.log()
  } catch (e) {
    log.error('配置文件创建失败', e)
  }
}

export default create
