import execa from 'execa'


async function deleteEmptyDir(dir: string) {
  let preResult = ''
  let executeAgain = true
  let count = 0
  while (executeAgain) {
    let result
    try {
      result = (await execa('find', [dir, '-type', 'd', '-empty'])).stdout
      if (result) {
        await execa('rmdir', result.split('\n').filter(Boolean))
      }
      executeAgain = preResult !== result && !!result
      preResult = result
    } catch (e) {
      executeAgain = false
    }
    count += 1;
  }
}

export default deleteEmptyDir
