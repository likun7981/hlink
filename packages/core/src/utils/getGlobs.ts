const getGlobs = (options?: IHlink.Rule | string[], defaultExts?: string[]) => {
  if (Array.isArray(options)) {
    options = {
      globs: [],
      exts: options,
    }
  }
  let { globs, exts } = options || {}
  exts = exts?.length ? exts : defaultExts
  globs = globs || []
  if (exts) {
    globs = globs.concat(exts.map((ext) => `*.${ext.toLowerCase()}`))
  }
  return globs
}

export default getGlobs
