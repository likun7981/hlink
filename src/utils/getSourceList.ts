import parseLs from './parseLs'

function getSourceList(sourceDir: string) {
  const sourceFiles: string[] = []
  const numbers: string[] = []
  const numbersKey: Record<string, string> = {}
  parseLs(sourceDir, (number, fullPath) => {
    sourceFiles.push(fullPath)
    numbers.push(number)
    numbersKey[number] = fullPath
  })
  return { sourceFiles, numbersKey, numbers }
}

export default getSourceList
