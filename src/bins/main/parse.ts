import path from 'path'
import * as paths from '../../paths.js'
import parseConfig from './parseConfig.js'
import { checkPathExist, log, warning } from '../../utils.js'
import fs from 'fs-extra'
import { Flags } from './index.js'

const resolvePath = (p: string) => (!!p ? path.resolve(p) : p)

function checkSaveMode(saveMode: number) {
  warning(
    [0, 1].indexOf(saveMode) === -1,
    '保存模式只能设置为0/1',
    '当前配置为',
    saveMode
  )
}

function checkDirectory(source: string, dest: string) {
  warning(!source || !dest, '必须指定原地址和目标地址')
  warning(!fs.existsSync(source), '源地址不存在，请检查路径是否正确')
  warning(source === dest, '源地址和目标地址不能相同')
}

async function checkConfigFile(configPath: string) {
  if(configPath && !(await checkPathExist(configPath, true))) {
    log.warn('指定的配置文件不存在')
    console.log()
    process.exit(0)
  }
}

async function parseInput(input: Array<string>) {
  let source = ''
  let dest = ''

  if (input.length === 1) {
    source = process.cwd()
    dest = input[0]
  } else if (input.length >= 2) {
    source = input[0]
    dest = input[1]
  }

  return {
    source: resolvePath(source),
    dest: resolvePath(dest)
  }
}

function getConfig(ci: any, config: any, defaultValue: any) {
  if (typeof ci === 'undefined') {
    if (typeof config === 'undefined') {
      return defaultValue
    }
    return config
  }
  return ci
}

async function parse(input: Array<string>, options: Flags) {
  options.configPath = path.isAbsolute(options.configPath) ? options.configPath : path.resolve(options.configPath)
  await checkConfigFile(options.configPath)
  let configPath = options.configPath || paths.configPath
  let { source, dest } = await parseInput(input)
  const {
    saveMode: configSaveMode,
    includeExtname: configIncludeExtname,
    excludeExtname: configExcludeExtname,
    source: configSource,
    dest: configDest,
    openCache: configOpenCache,
    mkdirIfSingle: configMkdirIfSingle
  } = await parseConfig(configPath)
  source = source || configSource || ''
  dest = dest || configDest || ''
  const {
    saveMode,
    includeExtname,
    excludeExtname,
    openCache,
    mkdirIfSingle
  } = options
  const exts = (includeExtname || configIncludeExtname || '')
    .split(',')
    .filter(Boolean)
    .map((s: string) => s.toLowerCase())
  const excludeExts = (excludeExtname || configExcludeExtname || '')
    .split(',')
    .filter(Boolean)
    .map((s: string) => s.toLowerCase())
  const finalSaveMode = saveMode || configSaveMode || 0
  const finalOpenCache = getConfig(openCache, configOpenCache, false)
  const finalMkdirIfSingle = getConfig(mkdirIfSingle, configMkdirIfSingle, true)
  checkDirectory(source, dest)
  checkSaveMode(finalSaveMode)
  return {
    saveMode: finalSaveMode,
    excludeExts,
    exts,
    source,
    dest,
    openCache: finalOpenCache,
    mkdirIfSingle: finalMkdirIfSingle,
    configPath: (await checkPathExist(configPath, true)) ? configPath : false
  }
}

export default parse
