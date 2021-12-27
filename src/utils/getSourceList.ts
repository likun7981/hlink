import parseLs from './parseLs'

function getSourceList(sourceDir: string) {
  const sourceFiles: string[] = []
  const sourceFileCache: Record<string, string> = {}
  const numbersKey: Record<string, string> = {}
  parseLs(sourceDir, (number, fullPath) => {
    sourceFiles.push(fullPath)
    numbersKey[number] = fullPath
    sourceFileCache[fullPath] = number
  })
  return { sourceFiles, numbersKey, sourceFileCache }
}

export default getSourceList
