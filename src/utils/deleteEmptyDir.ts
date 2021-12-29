import execa from 'execa'
async function deleteEmptyDir(dir: string) {
  let preResult = ''
  let executeAgain = true
  while (executeAgain) {
    try {
      const result = (await execa('find', [dir, '-type', 'd', '-empty'])).stdout
      if (result) {
        await execa('rmdir', result.split('\n'))
      }
      executeAgain = preResult !== result && result !== dir
      preResult = result
    } catch (e) {}
  }
}

export default deleteEmptyDir
