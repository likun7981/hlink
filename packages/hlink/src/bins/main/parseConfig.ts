import fs from 'fs-extra'
import { warning } from '../../utils.js'
import path from 'path'
import chalk from 'chalk'
import { pathToFileURL } from 'url'

type Config = Pick<IHlink.Flags, 'mkdirIfSingle' | 'saveMode' | 'openCache'> & {
  source: string
  dest: string
  includeExtname?: string[]
  excludeExtname?: string[]
}

async function parseConfig(configPath: string) {
  configPath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath)
  if (!fs.existsSync(configPath)) {
    return {}
  }
  const config = (await import(pathToFileURL(configPath).href))
    .default as Config
  const {
    saveMode,
    source,
    dest,
    includeExtname,
    excludeExtname,
    openCache,
    mkdirIfSingle,
  } = config
  if (source) {
    warning(
      !path.isAbsolute(source),
      '配置文件',
      chalk.cyan(configPath),
      '源地址必须指定绝对路径'
    )
  }
  if (dest) {
    warning(
      !path.isAbsolute(dest),
      '配置文件',
      chalk.cyan(configPath),
      '目标必须指定绝对路径'
    )
  }
  return {
    saveMode,
    source: path.resolve(source),
    dest: path.resolve(dest),
    includeExtname: includeExtname?.join(','),
    excludeExtname: excludeExtname?.join(','),
    openCache,
    mkdirIfSingle,
  }
}

export default parseConfig
