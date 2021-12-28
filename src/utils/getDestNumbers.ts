import getFileAndNumber from './getFileAndNumber'
import lsirf from './lsirf';

function getDestNumbers(dest: string) {
  let result: string[] = []
  lsirf(dest, true).split('\n')
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
