function getFileAndNumber(file: string) {
  file = file.trim() // 清除收尾空格
  const index = file.indexOf(' ')
  const number = file.slice(0, index)
  const filepath = file.slice(index + 1)
  return [number, filepath]
}

export default getFileAndNumber;
