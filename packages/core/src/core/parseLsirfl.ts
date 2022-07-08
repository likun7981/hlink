import path from 'path'
import parseFilePath from './parseFilePath.js'
import lsirf from './lsirfl.js'
import createDebug from 'debug'

const debug = createDebug('core:parseLsirfl')

async function parseLs(dir: string, ignoreError = false) {
  const str = await lsirf(dir, ignoreError)
  const files = str.split('\n').filter((a) => !a?.endsWith('/'))
  let currentDir = dir
  let prevIsBlank = true // 记录上一行是否是空行
  const results: { inode: string; fullPath: string }[] = []
  files.forEach((file: string) => {
    file = file.trim()
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
  debug(
    'Parsed result length: %d, first result is: %O',
    results.length,
    results[0]
  )
  return results
}

export async function getInodes(dest: string, ignoreError = false) {
  const inodes: string[] = []
  ;(await lsirf(dest, ignoreError)).split('\n').forEach((file) => {
    file = file.trim()
    if (Boolean(file) && !file.endsWith('/') && !file.endsWith(':')) {
      const [inode] = file.split(' ')
      if (inode) {
        inodes.push(inode)
      }
    }
  })
  return inodes
}

export default parseLs
