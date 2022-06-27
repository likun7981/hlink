import { isFunction } from './index'

export type TStatusType = 'succeed' | 'failed' | 'ongoing'

export const statusCopywrite: Record<TStatusType, string> = {
  succeed: '执行完成',
  failed: '执行出错',
  ongoing: '执行中...',
}

type TOptions = {
  onMessage?: (data: string, status: TStatusType) => void
  onError?: (e: any) => void
  onOpen?: (e: any) => void
}

function runTask(name: string, options: TOptions) {
  const { onError, onMessage, onOpen } = options
  if (window.EventSource) {
    const watched = new window.EventSource(`/api/task/run?name=${name}`)
    watched.onmessage = (event) => {
      const result = JSON.parse(event.data) as {
        output: string
        type: TStatusType
      }
      if (onMessage) {
        onMessage(result.output, result.type)
        if (result.type !== 'ongoing') {
          watched.close()
        }
      }
    }
    watched.onerror = (e) => {
      if (isFunction(onError)) {
        onError(e)
      }
    }
    watched.onopen = (e) => {
      if (isFunction(onOpen)) {
        onOpen(e)
      }
    }
    return watched
  } else {
    window.alert("Sorry, server logs aren't supported on this browser :(")
  }
}

export default runTask
