const getGlobs = (options?: IHlink.Rule, defaultExts?: string[]) => {
  let { globs, exts } = options || {}
  exts = exts || defaultExts
  globs = globs || []
  if (exts) {
    globs = globs.concat(exts.map((ext) => `**.${ext.toLowerCase()}`))
  }
  return globs
}

export default getGlobs
