import path from 'path'

type ConfigType = {
  exts: string[]
  excludeExts: string[]
  isDelete: boolean
}

function judge(
  destNumbers: string[],
  sourceNumbers: Record<string, string>,
  config: ConfigType
) {
  const keysOfSourceNumbers = Object.keys(sourceNumbers)
  const existFiles: string[] = []
  const waitLinkFiles: string[] = []
  const excludeFiles: string[] = []
  const { exts, excludeExts, isDelete } = config
  if (!isDelete) {
    const isWhiteList = !!exts.length
    keysOfSourceNumbers.forEach(num => {
      const fullPath = sourceNumbers[num]
      const extname = path
        .extname(fullPath)
        .replace('.', '')
        .toLowerCase()
      const isSupported = isWhiteList
        ? exts.indexOf(extname) > -1
        : excludeExts.indexOf(extname) === -1
      if (!isSupported) {
        excludeFiles.push(fullPath)
      } else if (destNumbers.indexOf(num) > -1) {
        existFiles.push(fullPath)
      } else {
        waitLinkFiles.push(fullPath)
      }
    })
  }
  return {
    existFiles,
    waitLinkFiles,
    excludeFiles,
  }
}

export default judge
