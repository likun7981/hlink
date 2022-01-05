import execa from 'execa'
import path from 'path'

function findParent(_paths: string[]) {
  let paths = [..._paths];
  if (!paths.length) return ''
  paths = paths.sort(
    (a, b) => a.split(path.sep).length - b.split(path.sep).length
  )
  const firstItem = paths.shift() as string;
  let dirname = path.join(path.dirname(firstItem), '/')
  while (!paths.every(p => p.includes(dirname))) {
    dirname = path.join(path.dirname(dirname), '/')
  }
  return dirname
}

async function deleteEmptyDir(dir: string | string[]) {
  if (Array.isArray(dir)) {
    if (dir.length) {
      dir = findParent(dir)
      if(!dir) return
    } else {
      return
    }
  }
  let preResult = ''
  let executeAgain = true
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
  }
}

export default deleteEmptyDir
