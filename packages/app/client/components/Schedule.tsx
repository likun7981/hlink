import { Drawer, Form, Input, message, Select } from 'antd'
import { TTask } from '../../types/shim'

type IProps = {
  onClose: () => void
  onSubmit: (value: TTask) => void
  edit: TTask
}

const Option = Select.Option

function Schedule(props: IProps) {
  const { onClose, onSubmit, edit } = props
  const [form] = Form.useForm<TTask>()

  const data: TTask = edit
  const type = Form.useWatch('scheduleType', form)

  if (!data.scheduleType) {
    data.scheduleType = 'loop'
  }

  return (
    <Drawer
      title={`${data.name} 定时任务设置`}
      visible
      contentWrapperStyle={{
        width: '100vw',
        maxWidth: 300,
      }}
      onClose={onClose}
      destroyOnClose
    >
      <Form
        layout="vertical"
        name="basic"
        autoComplete="off"
        initialValues={data}
        onFinish={(value) => {
          if (typeof onSubmit === 'function') {
            onSubmit({
              ...edit,
              ...value,
            })
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
          label="定时任务类型"
          name="scheduleType"
          rules={[
            { required: true, message: '必须填写名称' },
            { pattern: /^\w+$/, message: '文件名只能包含数字/字母/下划线' },
          ]}
        >
          <Select placeholder="请选择类型">
            <Option key="loop">定时循环(新手推荐)</Option>
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
            <Input placeholder="多少" prefix="每" suffix="秒执行一次" />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  )
}

export default Schedule
