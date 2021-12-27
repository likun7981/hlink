import execa from 'execa'
import getFileAndNumber from './getFileAndNumber'

function getDestNumbers(dest: string) {
  let result: string[] = []
  execa
    .sync('ls', ['-iRF', dest])
    .stdout.split('\n')
    .forEach(file => {
      if (Boolean(file) && !file.endsWith('/') && !file.endsWith(':')) {
        const [number] = getFileAndNumber(file)
        result.push(number)
      }
    })
  return {
    result
  }
}

export default getDestNumbers
