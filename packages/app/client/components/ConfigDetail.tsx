import { Drawer } from 'antd'
import { useEffect, useState } from 'react'
import { configService } from '../service'
import Editor from './Editor'

type IProps = {
  name?: string
  onClose: () => void
}

function ConfigDetail(props: IProps) {
  const { name, onClose } = props
  const [visible, setVisible] = useState(false)
  const configDetail = configService.useGet({
    onSuccess() {
      setVisible(true)
    },
    onError() {
      onClose()
    },
  })
  const handleClose = () => {
    setVisible(false)
    configDetail.getItem(undefined)
    onClose()
  }
  useEffect(() => {
    if (name) {
      configDetail.getItem(name)
    }
  }, [name])
  if (!visible) return null
  return (
    <Drawer
      title={`${name} 配置详情`}
      visible
      width="100vw"
      onClose={handleClose}
      destroyOnClose
    >
      <Editor
        readOnly
        className="flex-1 w-100%"
        value={configDetail.data?.detail}
      />
    </Drawer>
  )
}

export default ConfigDetail
