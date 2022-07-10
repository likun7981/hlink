import { message, Modal } from 'antd'
import React, { useEffect, useRef } from 'react'
import runTask, { getOkText, getStatusCopywrite } from '../kit/runTask'
import './RunDetail.less'
import { taskService } from '../service'
import RunPanel from './RunPanel'

type IProps = {
  name?: string
  onClose: () => void
}

type TUpdateProps = Parameters<ReturnType<typeof Modal.confirm>['update']>[0]

function RunDetail(props: IProps) {
  const { name, onClose } = props
  const logRef = useRef<string[]>([])
  function handleClose() {
    logRef.current = []
    onClose()
  }
  const task = taskService.useCheckConfig({
    onSuccess() {
      let modal: ReturnType<typeof Modal.confirm>
      if (name) {
        runTask(name, {
          onMessage(sendData) {
            const { output, status, type, confirm } = sendData
            if (output) {
              logRef.current = logRef.current.concat(output)
            }
            const updated: TUpdateProps = {
              title: (
                <>
                  任务 <span className="color-#08b">{name}</span>{' '}
                  {getStatusCopywrite(status, type)}
                </>
              ),
              content: <RunPanel data={logRef.current} />,
              okButtonProps: {
                loading: status === 'ongoing',
              },
              okText: getOkText(status, type, confirm),
            }
            if ((type === 'main' || !confirm) && status !== 'ongoing') {
              updated.onCancel = () => {}
              updated.cancelButtonProps = {
                disabled: true,
              }
            }
            if (type === 'prune' && status !== 'ongoing' && confirm) {
              updated.onCancel = () => {
                message.loading({ content: '取消中', key: 'cancelDelete' })
                return taskService
                  .makeDeleteFile(name, true)
                  .then(() => {
                    message.info({
                      content: '删除已取消',
                      key: 'cancelDelete',
                    })
                    handleClose()
                    return Promise.resolve()
                  })
                  .catch((e) => {
                    message.error({
                      content: `取消失败: ${e.mssage}`,
                      key: 'cancelDelete',
                    })
                    return Promise.reject()
                  })
              }
              updated.onOk = () => {
                modal.update({
                  okButtonProps: {
                    loading: true,
                  },
                  okText: '执行删除中',
                })
                return taskService
                  .makeDeleteFile(name)
                  .then(() => {
                    message.success({
                      content: '删除成功',
                      key: 'makeDelete',
                    })
                    handleClose()
                    return Promise.resolve()
                  })
                  .catch((e) => {
                    message.error({
                      content: `删除失败: ${e.mssage}`,
                      key: 'makeDelete',
                    })
                    return Promise.reject()
                  })
                  .then(() => {
                    modal.update({
                      okButtonProps: {
                        loading: false,
                      },
                      okText: '知道了',
                    })
                  })
              }
            }
            modal.update(updated)
          },
          onError() {
            message.error('执行出问题了,请重试~')
            handleClose()
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
              onOk() {
                handleClose()
              },
              onCancel() {
                return taskService
                  .cancel(name)
                  .then((result) => {
                    if (result) {
                      message.success('取消成功')
                    }
                  })
                  .catch((e) => {
                    message.error(e.message)
                  })
                  .finally(() => {
                    return Promise.reject('已取消')
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
      handleClose()
    },
  })
  useEffect(() => {
    if (name) {
      task.check(name)
    }
  }, [name])
  return null
}

export default RunDetail
