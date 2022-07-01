import { Button, Drawer, Form, Input, message, Space } from 'antd'
import { useState } from 'react'
import Editor from './Editor'
import { TConfig } from '../../types/shim'
import defaultConfig from '../kit/defaultConfig'

type TProps = {
  onClose: () => void
  onSubmit: (data: TConfig) => void
  data?: TConfig
}

function Config(props: TProps) {
  const { onClose, onSubmit, data } = props
  const [form] = Form.useForm<TConfig>()
  const [key, setKey] = useState(Date.now())
  return (
    <Drawer
      title={data ? `编辑 ${data.name} 配置` : '创建一个新配置'}
      onClose={onClose}
      width="100vw"
      visible
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
        initialValues={data}
        onFinish={(value) => {
          try {
            eval(
              `var $$hlink=${value?.detail?.replace(/(export|default)/g, '')}`
            )
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
        <Form.Item hidden name="configPath">
          <Input />
        </Form.Item>
        <Form.Item
          hidden={!!data}
          label="名称"
          name="name"
          rules={[
            { required: true, message: '必须填写名称' },
            { pattern: /^\w+$/, message: '文件名只能包含数字/字母/下划线' },
          ]}
        >
          <Input disabled={!!data} placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          rules={[
            {
              pattern: /^[\u4e00-\u9fa5\w]+$/,
              message: '文件名只能包含中文/数字/字母/下划线',
            },
          ]}
          label="描述"
          name="description"
        >
          <Input placeholder="请输入描述" />
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
          rules={[{ required: true, message: '必须填写配置详情' }]}
        >
          <Editor key={key} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default Config
