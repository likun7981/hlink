import { execa } from 'execa'

async function lsirf(path: string, ignoreError = false): Promise<string> {
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
