import path from 'path'
import * as paths from '../config/paths'
import parseConfig from '../config/parseConfig'
import { log, warning } from './index'
import fs from 'fs-extra'
import { deleteModeQuestion, deleteQuestion, getSource } from './questions'

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
  fs.ensureDirSync(dest)
  warning(source === dest, '源地址和目标地址不能相同')
}

async function parseInput(input: Array<string>, isDelete: boolean) {
  let isDeleteDir = false
  let isSecondDir = false
  let source = ''
  let sourceDir = ''
  let dest = ''
  if (isDelete) {
    const answerDeleteMode = await deleteModeQuestion()
    isDeleteDir = answerDeleteMode.deleteDir === '删除硬链文件以及其所在目录'
  }

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
    const saveRecords = paths.readSaveRecord()
    const [finalSource, finalSourceDir] = getSource(answers)
    source = finalSource
    sourceDir = finalSourceDir
    dest = answers.destDir || saveRecords[finalSourceDir][0]
    isSecondDir = answers.sourcePath === '二级目录'
  }

  return {
    source: resolvePath(source),
    sourceDir: resolvePath(sourceDir),
    dest: resolvePath(dest),
    isSecondDir,
    isDeleteDir
  }
}

async function parse(input: Array<string>, options: any) {
  const isDelete = !!options.d

  let configPath = options.configPath || paths.configPath

  let { source, sourceDir, isDeleteDir, isSecondDir, dest } = await parseInput(
    input,
    isDelete
  )
  const {
    maxFindLevel: mfl,
    saveMode: sm,
    includeExtname: ie,
    excludeExtname: ee,
    source: configSource,
    dest: configDest
  } = parseConfig(
    path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath)
  )
  source = source || configSource
  dest = dest || configDest
  const { s, i, m, e } = options
  const exts = (i || ie || '').split(',').filter(Boolean)
  const excludeExts = (e || ee || '').split(',').filter(Boolean)
  const saveMode = +(s || sm || 0)
  const maxFindLevel = +(m || mfl || 4)
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
    isDeleteDir,
    isSecondDir
  }
}

export default parse
