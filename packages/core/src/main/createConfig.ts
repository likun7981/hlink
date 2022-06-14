import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import { fileURLToPath } from 'url'
import { checkPathExist, log, warning } from '../utils/index.js'

export default async function createConfig(configPath: string) {
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
