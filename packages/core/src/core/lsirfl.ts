import { execa } from 'execa'
import fs from 'fs-extra'
import createDebug from 'debug'

const debug = createDebug('core:lsirfl')

async function lsirf(path: string, ignoreError = false): Promise<string> {
  await fs.ensureDir(path)
  try {
    const raw = (await execa('ls', ['-iRFL', path])).stdout
    debug(
      `ls path is %s, result length %d, raw is %s ...  `,
      path,
      raw?.length,
      raw?.slice(0, 100)
    )
    return raw
  } catch (e) {
    debug(`throw error %O`, e)
    if (!ignoreError) {
      throw e
    }
    return ''
  }
}

export default lsirf
