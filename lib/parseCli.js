const warning = require('./warning')
const path = require('path')
const paths = require('./configPaths')
const fs = require('fs')
const resolvePath = path.resolve

function checkSaveMode (saveMode) {
  warning([0, 1].indexOf(saveMode) === -1, '保存模式只能设置为0/1')
}
function checkFindLevels (levels) {
  warning(Number.isNaN(levels), '查找的最大层级maxFindLevel必须设置为数字')
  warning(levels > 6 || levels < 1, '保存的最大层级maxFindLevel不能小于1大于6')
}

function checkDirectory (source, dest) {
  warning(!fs.existsSync(source), '源地址不存在，请检查路径是否正确')
  fs.ensureDirSync(dest)
  warning(source === dest, '源地址和目标地址不能相同')
}

function parseInput (input, isDelete) {
  if (!isDelete) {
    warning(!input.length, '必须指定目标地址')
  }
  if (input.length === 1) {
    return [resolvePath(process.cwd()), resolvePath(input[0])]
  } else if (input.length >= 2) {
    return [resolvePath(input[0]), resolvePath(input[1])]
  } else {
    return []
  }
}

function parseCli (input, options) {
  const isDelete = !!options.d

  let useConfig = false
  let configPath = paths.configPath
  if ('useConfig' in options) {
    useConfig = true
  }
  if (options.useConfig) {
    configPath = options.useConfig
  }

  const [source, dest] = parseInput(input, isDelete)
  const { s, e, m, c } = options
  const exts = e.split(',').filter(Boolean)
  let excludeExts = c.split(',').filter(Boolean)
  if (exts.length) {
    excludeExts = false
  }

  const saveMode = +s
  const maxFindLevels = +m
  checkDirectory(source, dest)
  checkFindLevels(maxFindLevels)
  checkSaveMode(saveMode)
  return {
    saveMode,
    maxFindLevels,
    excludeExts,
    exts,
    source,
    dest,
    isDelete,
    useConfig,
    configPath
  }
}

module.exports = parseCli
