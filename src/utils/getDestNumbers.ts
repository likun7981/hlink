import execa from 'execa'
import path from 'path'
import getFileAndNumber from './getFileAndNumber'
import fs from 'fs-extra'

function getDestNumbers(dest: string) {
  let result: string[] = []

  if (fs.existsSync(dest)) {
    execa
      .sync('ls', ['-iRF', dest])
      .stdout.split('\n')
      .forEach(file => {
        if (Boolean(file) && !file.endsWith(path.sep) && !file.endsWith(':')) {
          const [number] = getFileAndNumber(file)
          result.push(number)
        }
      })
  }
  return {
    result
  }
}

export default getDestNumbers
