import execa from 'execa'
import path from 'path'

function getSourceList(sourceDir: string) {
  var str = execa.sync('ls', ['-iRF', sourceDir]).stdout
  const files = str.split('\n').filter(a => !a?.endsWith('/'))
  const sourceFiles: string[] = []
  const numbersKey: Record<string, string> = {}
  let currentDir = ''
  let prevIsBlank = true // 记录上一行是否是空行
  files.forEach((file: string) => {
    if (file.endsWith(':') && file.indexOf(sourceDir) === 0 && prevIsBlank) {
      prevIsBlank = false
      currentDir = file.replace(':', '')
    } else if (!file) {
      prevIsBlank = true
    } else {
      prevIsBlank = false
      const index = file.indexOf(' ')
      const number = file.slice(0, index)
      const filepath = file.slice(index + 1)
      const fullPath = path.join(
        path.isAbsolute(currentDir)
          ? currentDir
          : path.join(sourceDir, currentDir),
        filepath
      )
      sourceFiles.push(fullPath);
      numbersKey[number] = fullPath
    }
  })
  return { sourceFiles, numbersKey }
}

export default getSourceList
