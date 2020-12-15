
const execa = require('execa')
const fs = require('fs-extra')
const warning = require('./warning')
const path = require('path')

/**
 * dir /a/b
 * filepath /a/b/c/d
 * output: /b/c/d
 *
 */
function getDirBasePath (dir, filepath) {
  return path.join(path.basename(dir), path.relative(dir, filepath))
}

function getLinkPath (file, destPath, deleteDir) {
  const out = execa.sync('ls', ['-i', file]).stdout
  const fileNumber = out.split(' ')[0]
  let findOut = false
  findOut = execa.sync('find', [destPath, '-inum', fileNumber]).stdout
  return findOut ? findOut.split('\n').map(p => deleteDir ? path.dirname(p) : p) : []
}

function checkLinkExist (file, destPath) {
  const paths = getLinkPath(file, destPath)
  return paths.length >= 1
}

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

module.exports = {
  checkLinkExist,
  checkFindLevels,
  checkDirectory,
  checkSaveMode,
  getLinkPath,
  getDirBasePath
}
