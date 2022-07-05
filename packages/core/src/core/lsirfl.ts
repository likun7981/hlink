import { execa } from 'execa'
import fs from 'fs-extra'

async function lsirf(path: string, ignoreError = false): Promise<string> {
  await fs.ensureDir(path)
  try {
    return (await execa('ls', ['-iRFL', path])).stdout
  } catch (e) {
    if (!ignoreError) {
      throw e
    }
    return ''
  }
}

export default lsirf
