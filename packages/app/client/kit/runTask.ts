import { ModalFuncProps } from 'antd/lib/modal'
import { isFunction } from './index'

export type TStatusType = 'succeed' | 'failed' | 'ongoing'

const statusCopywrite: Record<TStatusType, string> = {
  succeed: '完成',
  failed: '出错',
  ongoing: '中...',
}

const actions: Record<TCommand, string> = {
  main: '执行',
  prune: '分析',
}

export type TCommand = 'main' | 'prune'

type TOptions = {
  onMessage?: (data: string, status: TStatusType, type: TCommand) => void
  onError?: (e: any) => void
  onOpen?: (e: any) => void
}

export function getStatusCopywrite(status: TStatusType, type: TCommand) {
  const actionText = actions[type]
  const statusText = statusCopywrite[status]
  return actionText + statusText
}

export function getOkText(status: TStatusType, type: TCommand) {
  if (status === 'ongoing') {
    return getStatusCopywrite(status, type)
  }
  if (type === 'prune') {
    return '确认'
  }
  return '知道了'
}

export function getCancelText(status: TStatusType, type: TCommand) {
  if (status === 'ongoing') {
    return undefined
  }
  if (type === 'prune') {
    return '取消'
  }
  return undefined
}

export function getModalType(
  status: TStatusType,
  type: TCommand
): ModalFuncProps['type'] {
  if (status === 'ongoing') {
    return 'info'
  }
  if (type === 'prune') {
    return 'confirm'
  }
  return 'info'
}

function runTask(name: string, options: TOptions) {
  const { onError, onMessage, onOpen } = options
  if (window.EventSource) {
    const watched = new window.EventSource(`/api/task/run?name=${name}`)
    watched.onmessage = (event) => {
      const result = JSON.parse(event.data) as {
        output: string
        status: TStatusType
        type: TCommand
      }
      if (onMessage) {
        onMessage(result.output, result.status, result.type)
        if (result.status !== 'ongoing') {
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
