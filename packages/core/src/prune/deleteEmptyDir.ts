import { execa } from 'execa'
import fs from 'fs-extra'
import { findParent } from '../utils/index.js'

async function deleteEmptyDir(dir: string | string[]) {
  if (Array.isArray(dir)) {
    if (dir.length) {
      dir = findParent(dir)
      if (!dir) return
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
        for (const emptyDir of result.split('\n').filter(Boolean)) {
          await fs.rmdir(emptyDir)
        }
      }
      executeAgain = preResult !== result && !!result
      preResult = result
    } catch (e) {
      executeAgain = false
    }
  }
}

export default deleteEmptyDir
