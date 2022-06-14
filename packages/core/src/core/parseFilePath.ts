import path from 'path'
import fs from 'fs-extra'

const endsWithes = ['*', '@']
const allNumber = /^[0-9]+$/

/**
 * @description 解析出inode及绝对路径
 * @param file inode+filepath
 * @param dir file的父级目录，必须是绝对路径
 * @returns [inode, absolutePath]
 */
function parseFilePath(file: string, dir = '') {
  const index = file.indexOf(' ')
  const inode = file.slice(0, index)
  let filepath = file.slice(index + 1)
  filepath = path.join(dir, filepath)
  endsWithes.forEach((endWith) => {
    if (filepath.endsWith(endWith) && !fs.existsSync(filepath)) {
      filepath = filepath.slice(0, filepath.lastIndexOf(endWith))
    }
  })
  if (!allNumber.test(inode)) {
    return false
  }
  if (!allNumber.test(inode)) {
    return false
  }
  return [inode, filepath]
}

export default parseFilePath
