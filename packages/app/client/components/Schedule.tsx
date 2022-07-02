import { Drawer, Form, Input, message, Select } from 'antd'
import { useEffect, useState } from 'react'
import { TSchedule } from '../../types/shim'

type IProps = {
  onClose: () => void
  onSubmit: (value: TSchedule) => void
  edit: TSchedule
  name: string
}

const Option = Select.Option

function Schedule(props: IProps) {
  const { onClose, onSubmit, edit, name } = props
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm<TSchedule>()
  const handleClose = () => {
    setVisible(false)
    onClose()
  }

  const data = edit || { type: 'loop' }
  const type = Form.useWatch('type', form)

  data.name = name

  return (
    <Drawer
      title={`${name} 定时任务设置`}
      visible={visible}
      width="100vw"
      onClose={handleClose}
      destroyOnClose
    >
      <Form
        layout="vertical"
        name="basic"
        autoComplete="off"
        initialValues={data}
        onFinish={(value) => {
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
        <Form.Item hidden name="name">
          <Input />
        </Form.Item>
        <Form.Item
          label="定时任务类型"
          name="type"
          rules={[
            { required: true, message: '必须填写名称' },
            { pattern: /^\w+$/, message: '文件名只能包含数字/字母/下划线' },
          ]}
        >
          <Select placeholder="请选择类型">
            <Option key="cycle">定时循环(小白推荐)</Option>
            <Option key="cron">计划任务(corn)</Option>
          </Select>
        </Form.Item>
        {type === 'cron' && (
          <Form.Item valuePropName="checked" label="cron规则" name="value">
            <Input placeholder="请输入corn规则" />
          </Form.Item>
        )}
        {type === 'loop' && (
          <Form.Item valuePropName="checked" label="执行周期" name="value">
            <Input placeholder="请输入周期" suffix="秒" />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  )
}

export default Schedule
