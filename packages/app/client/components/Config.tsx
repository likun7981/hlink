import { Button, Drawer, Form, Input, message, Space } from 'antd'
import { Suspense, useEffect, useState } from 'react'
import Editor from './Editor'
import { TConfig } from '../../types/shim'
import defaultConfig from '../kit/defaultConfig'

type TProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (data: TConfig) => void
  data?: TConfig
}

function Config(props: TProps) {
  const { visible, onClose, onSubmit, data } = props
  const [form] = Form.useForm<TConfig>()
  const [key, setKey] = useState(Date.now())
  if (!visible) {
    return null
  }
  return (
    <Drawer
      title={data ? '编辑配置' : '创建一个新配置'}
      width={720}
      onClose={onClose}
      visible={visible}
      extra={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button
            onClick={() => {
              form.submit()
            }}
            type="primary"
          >
            确定
          </Button>
        </Space>
      }
    >
      <Form
        layout="vertical"
        name="basic"
        autoComplete="off"
        initialValues={{
          name: data?.name,
          description: data?.description,
          detail: data?.detail,
        }}
        onFinish={(value) => {
          try {
            eval(`var $$hlink=${value.detail.replace(/(export|default)/g, '')}`)
          } catch (e) {
            const error = e as Error
            message.error('配置文件有错误' + error.message)
            return
          }
          if (typeof onSubmit === 'function') {
            onSubmit(value)
          }
        }}
        onFinishFailed={(errorInfo) => {
          const error = errorInfo.errorFields[0]
          if (error) {
            message.error(error.errors[0])
          }
        }}
        form={form}
        className="flex flex-col h-100%"
      >
        <Form.Item
          label="配置文件名"
          name="name"
          rules={[
            { required: true, message: '必须填写配置文件名' },
            { pattern: /^\w+$/, message: '文件名只能包含数字/字母/下划线' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="中文名称" name="description">
          <Input />
        </Form.Item>
        {data ? (
          <div className="mb-2">
            <Button
              onClick={() => {
                form.setFieldsValue({ detail: defaultConfig.get() })
                setKey(Date.now())
              }}
            >
              还原到默认配置
            </Button>
          </div>
        ) : null}
        <Form.Item
          noStyle
          label="配置详情"
          name="detail"
          className="flex-1"
          rules={[{ required: true, message: '必须填写配置详情' }]}
        >
          <Editor key={key} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default Config
