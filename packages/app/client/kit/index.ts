export const isFunction = (fn: unknown): fn is Function =>
  typeof fn === 'function'

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}
