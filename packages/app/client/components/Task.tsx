import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Switch,
  Alert,
  Table,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import type { PreviewResult } from '@hlink/core'
import { TTask } from '../../types/shim'
import { configService } from '../service'
import { previewTask } from '../service/task'
import FileFilterEditor from './FileFilterEditor'

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
  const data = edit || { reverse: false, type: 'main', fileFilter: null }
  const showReverse = Form.useWatch('type', form) === 'prune'
  const selectedConfig = Form.useWatch('config', form)
  const selectedFilter = Form.useWatch('fileFilter', form)
  const [preview, setPreview] = useState<PreviewResult>()
  const [previewing, setPreviewing] = useState(false)
  const previewVersion = useRef(0)
  useEffect(() => {
    previewVersion.current += 1
    setPreview(undefined)
    setPreviewing(false)
  }, [selectedConfig, selectedFilter, showReverse])
  useEffect(
    () => () => {
      previewVersion.current += 1
    },
    []
  )
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
        <Form.Item label="文件筛选" name="fileFilter">
          <FileFilterEditor />
        </Form.Item>
        {!showReverse && (
          <Space
            direction="vertical"
            style={{ width: '100%', paddingBottom: 24 }}
          >
            <Button
              loading={previewing}
              disabled={!selectedConfig}
              onClick={async () => {
                const version = ++previewVersion.current
                setPreviewing(true)
                setPreview(undefined)
                try {
                  const result = await previewTask(form.getFieldsValue())
                  if (version === previewVersion.current) setPreview(result)
                } catch (error) {
                  if (version === previewVersion.current)
                    message.error((error as Error).message)
                } finally {
                  if (version === previewVersion.current) setPreviewing(false)
                }
              }}
            >
              预览匹配结果
            </Button>
            {preview && (
              <>
                <Alert
                  type="info"
                  showIcon
                  message={`扫描 ${preview.total} 个文件：待硬链 ${
                    preview.counts.pending
                  }，已存在 ${preview.counts.exists}，缓存跳过 ${
                    preview.counts.cached
                  }，未匹配 ${preview.counts.excluded}。${
                    preview.truncated ? '仅显示前 100 条。' : ''
                  }预览不会创建硬链。`}
                />
                <Table
                  size="small"
                  dataSource={preview.files}
                  rowKey={(file) => `${file.source}:${file.target}`}
                  scroll={{ x: 600 }}
                  columns={[
                    {
                      title: '源文件',
                      dataIndex: 'source',
                      ellipsis: true,
                      render: (file: string) => (
                        <span title={file}>
                          {file.split('/').slice(-2).join('/')}
                        </span>
                      ),
                    },
                    {
                      title: '目标文件',
                      dataIndex: 'target',
                      ellipsis: true,
                      render: (file: string) => (
                        <span title={file}>
                          {file.split('/').slice(-2).join('/')}
                        </span>
                      ),
                    },
                    {
                      title: '结果',
                      dataIndex: 'status',
                      width: 110,
                      render: (status: keyof PreviewResult['counts']) =>
                        ({
                          pending: '待硬链',
                          exists: '已存在',
                          cached: '缓存跳过',
                          excluded: '未匹配',
                        }[status]),
                    },
                  ]}
                />
              </>
            )}
          </Space>
        )}
      </Form>
    </Drawer>
  )
}

export default Task
