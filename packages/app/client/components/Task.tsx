import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Switch,
} from 'antd'
import { TTask } from '../../types/shim'
import { configService } from '../service'

type TProps = {
  onClose: () => void
  onSubmit: (data: TTask) => void
  edit?: TTask
}

const Option = Select.Option

function Task(props: TProps) {
  const { onClose, onSubmit, edit } = props
  const [form] = Form.useForm<TTask>()
  const listResult = configService.useList()
  const data = edit || { reverse: false, type: 'main' }
  const showReverse = Form.useWatch('type', form) === 'prune'
  return (
    <Drawer
      title={edit ? '编辑任务' : '创建一个新任务'}
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
          label="任务名称"
          name="name"
          rules={[
            { required: true, message: '必须填写名称' },
            {
              pattern: /^[\u4e00-\u9fa5\w]+$/,
              message: '文件名只能包含中文/数字/字母/下划线',
            },
          ]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item
          label="任务类型"
          name="type"
          rules={[{ required: true, message: '必须选择任务类型' }]}
        >
          <Select placeholder="请选择类型">
            <Option key="main">硬链(hlink)</Option>
            <Option key="prune">同步(hlink prune)</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="配置文件"
          name="config"
          rules={[{ required: true, message: '必须选择配置文件' }]}
        >
          <Select placeholder="请选择配置文件" loading={!listResult.data}>
            {listResult.data?.map((config) => (
              <Option key={config.name}>
                {config.name}
                {config.description ? `(${config.description})` : null}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {showReverse && (
          <Form.Item
            valuePropName="checked"
            label="是否反向检测"
            name="reverse"
          >
            <Switch defaultChecked={false} />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  )
}

export default Task
