import fs from 'fs-extra'

function parseConfig(configPath: string) {
  if (!fs.existsSync(configPath)) {
    return {}
  }
  const {
    saveMode,
    source,
    dest,
    includeExtname,
    excludeExtname,
    maxFindLevel
  } = require(configPath)
  return {
    saveMode,
    maxFindLevel,
    source: typeof source === 'string' ? [source] : source,
    dest: typeof dest === 'string' ? [dest] : dest,
    includeExtname: includeExtname.join(','),
    excludeExtname: excludeExtname.join(',')
  }
}

export default parseConfig
