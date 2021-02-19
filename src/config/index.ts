import fs from 'fs-extra'
import * as paths from './paths'
import path from 'path'
import chalk from 'chalk'
import { log, warning } from '../utils'

function createConfig(createPath = paths.configPath) {
  if (fs.existsSync(createPath)) {
    warning(
      fs.existsSync(createPath),
      `配置文件已存在 ${chalk.cyan(createPath)} 请勿重复创建`
    )
  }
  try {
    fs.ensureDirSync(path.dirname(createPath))
    const content = fs.readFileSync(path.join(__dirname, './hlink.config.tpl'))
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

export default createConfig
