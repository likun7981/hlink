import execa from 'execa'
import path from 'path'
import getFileAndNumber from './getFileAndNumber'

function parseLs(
  dir: string,
  callback: (num: string, fullPath: string) => void
) {
  var str = execa.sync('ls', ['-iRF', dir]).stdout
  const files = str.split('\n').filter(a => !a?.endsWith('/'))
  let currentDir = ''
  let prevIsBlank = true // 记录上一行是否是空行
  files.forEach((file: string) => {
    // 上一行是空行，并且是:结尾，表示是目录
    if (file.endsWith(':') && file.indexOf(dir) === 0 && prevIsBlank) {
      prevIsBlank = false
      currentDir = file.replace(':', '')
      // 空行
    } else if (!file) {
      prevIsBlank = true
    } else {
      prevIsBlank = false
      file = file.trim() // 清除收尾空格
      const [number, filepath] = getFileAndNumber(file)
      const fullPath = path.join(
        currentDir
          ? path.isAbsolute(currentDir)
            ? currentDir
            : path.join(dir, currentDir)
          : '',
        filepath
      )
      callback(number, fullPath)
    }
  })
}

export default parseLs
