import getDestNumbers from './getDestNumbers'
import parseLs from './parseLs'
function getAllFiles(dir: string) {
  const numbersKey: Record<string, string[]> = {}
  parseLs(dir, (number, fullPath) => {
    if (numbersKey[number]) {
      numbersKey[number].push(fullPath)
    } else {
      numbersKey[number] = [fullPath]
    }
  }, true)
  return numbersKey
}

function getDeleteList(source: string, dest: string) {
  const numbersKey = getAllFiles(dest)
  const { result } = getDestNumbers(source)
  let deleteList: string[] = []
  result.forEach(r => {
    const list = numbersKey[r]
    if (list) {
      deleteList = deleteList.concat(list)
    }
  })
  return deleteList
}

export default getDeleteList
