import { IHlink } from '../IHlink.js'

const getGlobs = (
  options?: IHlink.Rule | string[] | string,
  defaultGlobs: string[] = []
) => {
  if (typeof options === 'string') {
    return [options]
  }
  if (Array.isArray(options)) {
    options = {
      globs: [],
      exts: options,
    }
  }
  let { globs, exts } = options || {}
  globs = globs || []
  if (exts) {
    globs = globs.concat(exts.map((ext) => `*.${ext.toLowerCase()}`))
  }
  if (!globs.length) {
    globs = globs.concat(defaultGlobs)
  }
  return globs
}

export default getGlobs
