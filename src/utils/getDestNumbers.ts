import execa from 'execa'
import path from 'path'
import getFileAndNumber from './getFileAndNumber'

function getDestNumbers(dest: string) {
  let result: string[] = []
  execa
    .sync('ls', ['-iRF', dest])
    .stdout.split('\n')
    .forEach(file => {
      if (Boolean(file) && !file.endsWith(path.sep) && !file.endsWith(':')) {
        const [number] = getFileAndNumber(file)
        result.push(number)
      }
    })
  return {
    result
  }
}

export default getDestNumbers
