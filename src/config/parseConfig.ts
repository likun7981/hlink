import fs from 'fs-extra'
import { warning } from '../utils'
import path from 'path'
import chalk from 'chalk'

function parseConfig(configPath: string) {
  if (!fs.existsSync(configPath)) {
    return {}
  }
  const {
    saveMode,
    source,
    dest,
    includeExtname,
    excludeExtname,
    maxFindLevel
  } = require(configPath)
  if (source) {
    warning(
      !path.isAbsolute(source),
      '配置文件',
      chalk.cyan(configPath),
      '源地址必须指定绝对路劲'
    )
  }
  if (dest) {
    warning(
      !path.isAbsolute(dest),
      '配置文件',
      chalk.cyan(configPath),
      '目标必须指定绝对路劲'
    )
  }
  return {
    saveMode,
    maxFindLevel,
    source,
    dest,
    includeExtname: includeExtname.join(','),
    excludeExtname: excludeExtname.join(',')
  }
}

export default parseConfig
