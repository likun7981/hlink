import { execaSync } from 'execa'

function lsirf(path: string, ignoreError = false): string {
  try {
    return execaSync('ls', ['-iRFL', path]).stdout
  } catch (e) {
    if (!ignoreError) {
      throw e
    }
    return ''
  }
}

export default lsirf
