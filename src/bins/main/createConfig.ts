import { configPath } from '../../paths.js'
import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import { warning, log } from '../../utils.js'
import { fileURLToPath } from 'url'

export default function createConfig(createPath?: string | false) {
  createPath = createPath || configPath
  if (fs.existsSync(createPath)) {
    warning(
      fs.existsSync(createPath),
      `配置文件已存在 ${chalk.cyan(createPath)} 请勿重复创建`
    )
  }
  try {
    fs.ensureDirSync(path.dirname(createPath))
    const content = fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../hlink.config.tpl')
    )
    fs.writeFileSync(createPath, content)
    log.success('配置文件创建成功, 路径为', chalk.cyan(createPath))
    log.success(
      '如果你忘记了路径，可以再次使用',
      chalk.cyan('hlink -g'),
      '查看配置文件路径'
    )
    console.log()
  } catch (e) {
    log.error('配置文件创建失败', e)
  }
}
