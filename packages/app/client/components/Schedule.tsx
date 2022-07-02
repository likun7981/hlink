import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Typography,
} from 'antd'
import { TSchedule } from '../../types/shim'

type IProps = {
  onClose: () => void
  onSubmit: (value: TSchedule) => void
  name: string
}

const Option = Select.Option

function Schedule(props: IProps) {
  const { onClose, onSubmit, name } = props
  const [form] = Form.useForm<{
    scheduleType: TSchedule['scheduleType']
    loopValue: string
    cronValue: string
  }>()

  const type = Form.useWatch('scheduleType', form)

  return (
    <Drawer
      title={`${name} 定时任务设置`}
      visible
      contentWrapperStyle={{
        width: '100vw',
        maxWidth: 450,
      }}
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
      onClose={onClose}
      destroyOnClose
    >
      <Form
        layout="vertical"
        name="basic"
        autoComplete="off"
        initialValues={{
          name,
        }}
        onFinish={(value) => {
          if (typeof onSubmit === 'function') {
            onSubmit({
              name,
              scheduleType: value.scheduleType,
              scheduleValue:
                value.scheduleType === 'cron'
                  ? value.cronValue
                  : value.loopValue,
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
          rules={[{ required: true, message: '必须选择类型' }]}
        >
          <Select placeholder="请选择类型">
            <Option key="loop">定时循环(新手推荐)</Option>
            <Option key="cron">计划任务(cron)</Option>
          </Select>
        </Form.Item>
        {type === 'cron' && (
          <Form.Item
            rules={[{ required: true, message: '填入cron规则' }]}
            label="cron规则"
            name="cronValue"
            extra={
              <div className="pt-5px">
                需要帮助?
                <Typography.Link
                  target="_blank"
                  href="https://tooltt.com/crontab/c/56.html"
                >
                  点击查找
                </Typography.Link>
                crontab规则
              </div>
            }
          >
            <Input placeholder="请输入cron规则" />
          </Form.Item>
        )}
        {type === 'loop' && (
          <Form.Item
            rules={[{ required: true, message: '填入执行周期' }]}
            label="执行周期"
            name="loopValue"
          >
            <Input placeholder="多少" prefix="每" suffix="秒执行一次" />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  )
}

export default Schedule
