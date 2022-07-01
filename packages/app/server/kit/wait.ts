export const wait = async (timer: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(1), timer)
  })
}
