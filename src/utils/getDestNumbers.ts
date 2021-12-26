import execa from 'execa'

function getDestNumbers(dest: string) {
  let result: string[] = []
  execa
    .sync('ls', ['-iRF', dest])
    .stdout.split('\n')
    .forEach(file => {
      if (Boolean(file) && !file.endsWith('/') && !file.endsWith(':')) {
        const index = file.indexOf(' ')
        const number = file.slice(0, index)
        result.push(number)
      }
    })
  return {
    result
  }
}

export default getDestNumbers;
