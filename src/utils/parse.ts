import path from 'path'
import * as paths from '../config/paths'
import parseConfig from '../config/parseConfig'
import { log, warning } from './index'
import fs from 'fs-extra'
import { deleteQuestion, getSource } from './questions'

const resolvePath = (p: string) => (!!p ? path.resolve(p) : p)

function checkSaveMode(saveMode: number) {
  warning(
    [0, 1].indexOf(saveMode) === -1,
    '保存模式只能设置为0/1',
    '当前配置为',
    saveMode
  )
}
function checkFindLevel(level: number) {
  warning(
    Number.isNaN(level),
    '查找的最大层级maxFindLevel必须设置为数字',
    '当前配置为',
    level
  )
  if (level > 6) {
    log.warn('最大层级maxFindLevel大于6 可能会有性能问题! 请根据情况自行处理')
  }
  warning(level < 1, '保存的最大层级maxFindLevel不能小于1', '当前配置为', level)
}

function checkDirectory(source: string, dest: string) {
  warning(!source || !dest, '必须指定原地址和目标地址')
  warning(!fs.existsSync(source), '源地址不存在，请检查路径是否正确')
  warning(source === dest, '源地址和目标地址不能相同')
}

async function parseInput(input: Array<string>, isDelete: boolean) {
  let source = ''
  let sourceDir = ''
  let dest = ''

  if (input.length === 1) {
    source = process.cwd()
    sourceDir = process.cwd()
    dest = input[0]
  } else if (input.length >= 2) {
    source = input[0]
    sourceDir = input[0]
    dest = input[1]
  } else if (isDelete) {
    const answers = await deleteQuestion()
    const saveRecords = paths.deleteConfig.read()
    const [finalSource, finalSourceDir] = getSource(answers)
    source = finalSource
    sourceDir = finalSourceDir
    dest = answers.destDir || saveRecords[finalSourceDir][0]
  }

  return {
    source: resolvePath(source),
    sourceDir: resolvePath(sourceDir),
    dest: resolvePath(dest),
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

async function parse(input: Array<string>, options: any) {
  const isDelete = !!options.d

  let configPath = options.configPath || paths.configPath

  let { source, sourceDir, dest } = await parseInput(
    input,
    isDelete
  )
  const {
    maxFindLevel: mfl,
    saveMode: sm,
    includeExtname: ie,
    excludeExtname: ee,
    source: configSource,
    dest: configDest,
    openCache: configOpenCache,
    mkdirIfSingle: configMkdirIfSingle
  } = parseConfig(configPath)
  source = source || configSource || ''
  sourceDir = sourceDir || source
  dest = dest || configDest || ''
  const { s, i, m, e, openCache, mkdirIfSingle } = options
  const exts = (i || ie || '')
    .split(',')
    .filter(Boolean)
    .map((s: string) => s.toLowerCase())
  const excludeExts = (e || ee || '')
    .split(',')
    .filter(Boolean)
    .map((s: string) => s.toLowerCase())
  const saveMode = +(s || sm || 0)
  const maxFindLevel = +(m || mfl || 4)
  const finalOpenCache = getConfig(openCache, configOpenCache, true)
  const finalMkdirIfSingle = getConfig(mkdirIfSingle, configMkdirIfSingle, true)
  checkDirectory(source, dest)
  checkFindLevel(maxFindLevel)
  checkSaveMode(saveMode)
  return {
    saveMode,
    maxFindLevel,
    excludeExts,
    exts,
    source,
    dest,
    isDelete,
    sourceDir,
    openCache: finalOpenCache,
    mkdirIfSingle: finalMkdirIfSingle,
  }
}

export default parse
