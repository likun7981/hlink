type TOptions<T> = {
  callback: (param: T, index: number) => Promise<any>
  groupSize?: number
  waitExecArray: Array<T>
}

async function execAsyncByGroup<T>(options: TOptions<T>) {
  const { groupSize = 21, waitExecArray, callback } = options
  let count = 0
  for (let i = 0, len = waitExecArray.length / groupSize; i < len; i++) {
    const start = i * groupSize
    const end = (i + 1) * groupSize
    await Promise.all(
      await waitExecArray
        .slice(start, end)
        .map((p, index) => callback(p, index * (i + 1)))
    )
    count += 1
  }
  return count
}

export default execAsyncByGroup
