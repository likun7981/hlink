import path from 'path'
import * as paths from '../config/paths'
import { warning } from './index'
import fs from 'fs-extra'
import { SaveMode } from '../types'
import { deleteModeQuestion, deleteQuestion, getSource } from './questions'

const resolvePath = path.resolve

function checkSaveMode(saveMode: SaveMode) {
  warning([0, 1].indexOf(saveMode) === -1, '保存模式只能设置为0/1')
}
function checkFindLevels(levels: number) {
  warning(Number.isNaN(levels), '查找的最大层级maxFindLevel必须设置为数字')
  warning(levels > 6 || levels < 1, '保存的最大层级maxFindLevel不能小于1大于6')
}

function checkDirectory(source: string, dest: string) {
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
  if (!isDelete) {
    warning(!input.length, '必须指定目标地址')
  } else {
    const noRecordFile = !fs.existsSync(paths.mapJson)
    const noRecord =
      !noRecordFile && !Object.keys(fs.readJSONSync(paths.mapJson)).length
    warning(
      noRecordFile || noRecord,
      '你没有创建记录，你必须手动指定目标地址及源地址来进行删除操作'
    )
    const answerDeleteMode = await deleteModeQuestion()
    isDeleteDir = answerDeleteMode.deleteDir === '删除硬链文件以及其所在目录'
  }

  if (input.length === 1) {
    source = process.cwd()
    dest = input[0]
  } else if (input.length >= 2) {
    source = input[0]
    dest = input[1]
  } else if (isDelete) {
    const pathsMap = fs.readJSONSync(paths.mapJson)
    const answers = await deleteQuestion()
    const [finalSource, finalSourceDir] = getSource(answers)
    source = finalSource
    sourceDir = finalSourceDir
    dest = answers.destDir || pathsMap[finalSourceDir][0]
    isSecondDir = answers.sourcePath === '二级目录'
  } else {
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

  let useConfig = false
  let configPath = paths.configPath
  if ('useConfig' in options) {
    useConfig = true
  }
  if (options.useConfig) {
    configPath = options.useConfig
  }

  let { source, sourceDir, isDeleteDir, isSecondDir, dest } = await parseInput(
    input,
    isDelete
  )
  const { s, e, m, c } = options
  const exts = e.split(',').filter(Boolean)
  let excludeExts = c.split(',').filter(Boolean)
  if (exts.length) {
    excludeExts = false
  }

  const saveMode: SaveMode = +s as SaveMode
  const maxFindLevels = +m
  checkDirectory(source, dest)
  checkFindLevels(maxFindLevels)
  checkSaveMode(saveMode as SaveMode)
  return {
    saveMode,
    maxFindLevels,
    excludeExts,
    exts,
    source,
    dest,
    isDelete,
    useConfig,
    configPath,
    sourceDir,
    isDeleteDir,
    isSecondDir
  }
}

export default parse
