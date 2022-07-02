import { TSendData, TTaskStatus, TTaskType } from '../../types/shim'
import { isFunction } from './index'

const statusCopywrite: Record<TTaskStatus, string> = {
  succeed: '完成',
  failed: '出错',
  ongoing: '中...',
}

const actions: Record<TTaskType, string> = {
  main: '执行',
  prune: '分析',
}

type TOptions = {
  onMessage?: (data: TSendData) => void
  onError?: (e: any) => void
  onOpen?: (e: any) => void
}

export function getStatusCopywrite(status: TTaskStatus, type: TTaskType) {
  const actionText = actions[type]
  const statusText = statusCopywrite[status]
  return actionText + statusText
}

export function getOkText(
  status: TTaskStatus,
  type: TTaskType,
  confirm?: boolean
) {
  if (status === 'ongoing') {
    return getStatusCopywrite(status, type)
  }
  if (type === 'prune' && confirm) {
    return '确认'
  }
  return '知道了'
}

function runTask(name: string, options: TOptions) {
  const { onError, onMessage, onOpen } = options
  if (window.EventSource) {
    const watched = new window.EventSource(`/api/task/run?name=${name}`)
    watched.onmessage = (event) => {
      const result = JSON.parse(event.data) as TSendData
      if (onMessage) {
        onMessage(result)
        if (result.status !== 'ongoing') {
          watched.close()
        }
      }
    }
    watched.onerror = (e) => {
      watched.close()
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
