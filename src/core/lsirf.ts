import execa from 'execa'

function lsirf(path: string, ignoreError = false) {
  try {
    return execa.sync('ls', ['-iRF', path]).stdout
  } catch (e) {
    if (!ignoreError) {
      throw e
    }
    return ''
  }
}

export default lsirf
