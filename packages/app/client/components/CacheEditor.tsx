import { Button, Drawer, message, Space } from 'antd'
import { useEffect, useRef, useState } from 'react'
import fetch from '../kit/fetch'
import { cacheService } from '../service'
import Editor from './Editor'

type IProps = {
  visible: boolean
  onClose: () => void
}

function CacheEditor(props: IProps) {
  const { onClose, visible } = props
  const valueRef = useRef<string>()
  const cacheDetail = cacheService.useGet()
  const handleClose = () => {
    onClose()
  }
  if (!visible) return null
  return (
    <Drawer
      title="编辑缓存"
      visible={visible}
      width="100vw"
      onClose={handleClose}
      extra={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button
            onClick={async () => {
              if (valueRef.current !== cacheDetail.data) {
                valueRef.current = valueRef.current?.trim()
                if (!valueRef.current) {
                  valueRef.current = '[]'
                }
                try {
                  const value = JSON.stringify(JSON.parse(valueRef.current))
                  await fetch.put<boolean>('/api/cache', {
                    content: value,
                  })
                  onClose()
                  cacheDetail.mutate()
                } catch (e) {
                  message.error((e as Error).message)
                }
              }
            }}
            type="primary"
          >
            确定
          </Button>
        </Space>
      }
    >
      {cacheDetail.data && (
        <Editor
          type="json"
          className="flex-1 w-100%"
          value={cacheDetail.data || ''}
          onChange={(v) => (valueRef.current = v)}
        />
      )}
    </Drawer>
  )
}

export default CacheEditor
