import execa from 'execa'
async function deleteEmptyDir(dir: string) {
  let preResult = ''
  let executeAgain = true
  while (executeAgain) {
    const result = (await execa('find', [dir, '-type', 'd', '-empty'])).stdout
    if (result) {
      await execa('rmdir', result.split('\n'))
    }
    executeAgain = preResult !== result && result !== dir
    preResult = result
  }
}

export default deleteEmptyDir
