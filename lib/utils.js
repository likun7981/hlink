
const execa = require('execa')
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

module.exports = {
  checkLinkExist,
  getLinkPath,
  getDirBasePath
}
