
const execa = require('execa');
const fs = require('fs-extra');
const warning = require('./warning');
const path = require('path');
const log = require('./log');
const chalk = require('chalk');

function getTopDir(file, destPath) {
  while (path.dirname(file) !== destPath) {
    file = path.dirname(file)
  }
  return file
}

/**
 * dir /a/b
 * filepath /a/b/c/d
 * output: /b/c/d
 *
 */

function getDirBasePath(dir, filepath) {
  return path.join(path.basename(dir), path.relative(dir, filepath))
}


function getLinkPath(file, destPath, destDir) {
  const out = execa.sync('ls', ['-i', file]).stdout;
  const fileNumber = out.split(' ')[0]
  let findOut = false
  try {
    findOut = execa.sync('find', [destPath, '-inum', fileNumber]).stdout
  } catch (e) {
    throw new Error('ALREADY_DELETE');
  }
  if (destDir && !!findOut) {
    return [getTopDir(destPath, destDir)];
  }
  return !!findOut ? findOut.split('\n') : [];
}
function checkLinkExist(file, destPath) {
  const paths = getLinkPath(file, destPath)
  return paths.length >= 1;
}



function checkLevels(levels) {
  warning(Number.isNaN(levels), "保存的最大层级saveDirLevel必须设置为数字");
  warning(
    levels > 2 || levels < 0,
    "保存的最大层级saveLevel只能设置为0/1/2"
  );
}
function checkFindLevels(levels) {
  warning(Number.isNaN(levels), "查找的最大层级maxFindLevel必须设置为数字");
  warning(levels > 6 || levels < 1, "保存的最大层级maxFindLevel不能小于1大于6");
}

function checkDirectory(source, dest) {
  fs.ensureDirSync(dest);
  warning(source === dest, "起始地址和目标地址不能相同");
}

module.exports = {
  checkLinkExist,
  checkFindLevels,
  checkDirectory,
  checkLevels,
  getLinkPath,
  getDirBasePath
};
