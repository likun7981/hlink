import { Button, message, Modal } from 'antd'
import confirm from 'antd/lib/modal/confirm'
import React, { useEffect, useRef, useState } from 'react'
import runTask, {
  getCancelText,
  getModalType,
  getOkText,
  getStatusCopywrite,
} from '../kit/runTask'
// @ts-ignore
import ansiHtml from 'ansi-html'
import './RunDetail.css'
import { taskService } from '../service'
import fetch from '../kit/fetch'

ansiHtml.setColors({
  red: 'ca372d',
  green: '4c7b3a',
  yellow: 'c6c964',
  blue: '4387cf',
  magenta: 'b86cb4',
  cyan: '71d2c4',
  white: 'c3cac1',
  gray: '9a9b99',
})
type IProps = {
  name?: string
  onClose: () => void
}

function RunDetail(props: IProps) {
  const { name, onClose } = props
  const logRef = useRef<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const task = taskService.useCheckConfig({
    onSuccess() {
      let modal: ReturnType<typeof confirm>
      if (name) {
        runTask(name, {
          onMessage(data, status, type) {
            logRef.current = logRef.current.concat(data)
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: containerRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }
            }, 10)

            modal.update({
              title: (
                <>
                  任务 <span className="color-#08b">{name}</span>{' '}
                  {getStatusCopywrite(status, type)}
                </>
              ),
              content: (
                <div
                  ref={containerRef}
                  style={{ whiteSpace: 'pre-wrap' }}
                  className="max-h-40vh overflow-auto -ml-38px rounded-1 p-2 bg-#191919 text-#c3cac1 hlink-run-container"
                  dangerouslySetInnerHTML={{
                    __html: Array.from(new Set(logRef.current.concat(data)))
                      .map(ansiHtml)
                      .join('\n'),
                  }}
                ></div>
              ),
              okButtonProps: {
                loading: status === 'ongoing',
              },
              okText: getOkText(status, type),
              cancelButtonProps: {
                disabled: status !== 'ongoing',
              },
              type: getModalType(status, type),
            })
          },
          onError() {
            message.error('执行出问题了,请重试~')
            onClose()
          },
          onOpen() {
            task.check(undefined)
            modal = Modal.confirm({
              type: 'info',
              title: (
                <>
                  任务 <span className="color-#08b">{name}</span> 执行中
                </>
              ),
              content: '',
              onOk() {
                logRef.current = []
                onClose()
              },
              onCancel() {
                return new Promise((resolve, reject) => {
                  fetch
                    .get<boolean>('/api/task/cancel', { name })
                    .then((result) => {
                      if (result) {
                        reject()
                        message.success('取消成功')
                      }
                    })
                    .catch((e) => {
                      reject()
                      message.error(e.message)
                    })
                })
              },
              cancelText: '取消',
              width: '80vw',
            })
          },
        })
      }
    },
    onError() {
      onClose()
    },
  })
  useEffect(() => {
    let watched: EventSource
    if (name) {
      task.check(name)
    }

    return () => {
      if (watched) {
        watched.close()
      }
    }
  }, [name])
  return null
}

export default RunDetail
