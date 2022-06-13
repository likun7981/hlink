import path from 'path'
import parseFilePath from './parseFilePath.js'
import lsirf from './lsirfl.js'

function parseLs(dir: string, ignoreError = false) {
  const str = lsirf(dir, ignoreError)
  const files = str.split('\n').filter((a) => !a?.endsWith('/'))
  let currentDir = dir
  let prevIsBlank = true // 记录上一行是否是空行
  const results: { inode: string; fullPath: string }[] = []
  files.forEach((file: string) => {
    // 上一行是空行，并且是:结尾，表示是目录
    if (file.endsWith(':') && file.indexOf(dir) === 0 && prevIsBlank) {
      prevIsBlank = false
      // 这里不能用replace，必须用lastIndexOf, 不然windows无法使用
      currentDir = file.slice(0, file.lastIndexOf(':'))
      currentDir = path.isAbsolute(currentDir)
        ? currentDir
        : path.join(dir, currentDir)
      // 空行
    } else if (!file) {
      prevIsBlank = true
    } else {
      prevIsBlank = false
      file = file.trim() // 去掉收尾空格
      const result = parseFilePath(file, currentDir)
      if (result) {
        const [inode, fullPath] = result
        results.push({
          inode,
          fullPath,
        })
      }
    }
  })
  return results
}

export function getInodes(dest: string) {
  const inodes: string[] = []
  lsirf(dest, true)
    .split('\n')
    .forEach((file) => {
      if (Boolean(file) && !file.endsWith('/') && !file.endsWith(':')) {
        const [inode] = file.split(' ')
        inodes.push(inode)
      }
    })
  return inodes
}

export default parseLs
