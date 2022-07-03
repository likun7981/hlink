import { Button, Card, Empty, List, Popconfirm } from 'antd'
import { useState } from 'react'
import Config from './Config.js'
import { configService } from '../service/index.js'
import {
  DeleteOutlined,
  EditOutlined,
  FullscreenOutlined,
} from '@ant-design/icons'
import ConfigDetail from './ConfigDetail'
import Tooltip from './Tooltip'

const Item = List.Item

function ConfigList() {
  const [visible, setVisible] = useState(false)
  const [showConfigName, setShowConfigName] = useState<string>()
  const listResult = configService.useList()
  const optConfig = configService.useAddOrEdit({
    onSuccess() {
      setVisible(false)
      config.getItem(undefined)
      listResult.mutate()
    },
  })
  const config = configService.useGet({
    onSuccess() {
      setVisible(true)
    },
  })
  const deleteConfig = configService.useDelete({
    onSuccess() {
      listResult.mutate()
    },
  })

  const handleCreate = () => {
    setVisible(true)
  }

  return (
    <>
      <Card
        className="bg-white px-2"
        title={<div className="font-600 text-size-lg">配置列表</div>}
        extra={
          !!listResult.data?.length && (
            <Button type="primary" onClick={handleCreate}>
              创建配置
            </Button>
          )
        }
      >
        {!listResult.data?.length ? (
          <Empty description="暂无配置">
            <Button type="primary" size="small" onClick={handleCreate}>
              立即创建
            </Button>
          </Empty>
        ) : (
          listResult.data?.map((item) => (
            <Item
              className="border-b border-#eee"
              key={item.name}
              actions={[
                <Tooltip title="编辑">
                  <Button
                    type="link"
                    onClick={() => {
                      config.getItem(item.name)
                    }}
                    shape="circle"
                    // @ts-ignore
                    icon={<EditOutlined />}
                  />
                </Tooltip>,
                <Tooltip title="删除">
                  <Popconfirm
                    placement="bottom"
                    title="确认删除此配置?"
                    onConfirm={() => {
                      deleteConfig.rmItem(item.name)
                    }}
                    okText="是"
                    cancelText="否"
                  >
                    <Button
                      type="link"
                      shape="circle"
                      // @ts-ignore
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Tooltip>,
                <Tooltip title="配置详情">
                  <Button
                    type="link"
                    onClick={() => {
                      setShowConfigName(item.name)
                    }}
                    // @ts-ignore
                    icon={<FullscreenOutlined key="detail" />}
                  />
                </Tooltip>,
              ]}
            >
              <Item.Meta
                title={item.name}
                description={item.description || item.name}
              />
            </Item>
          ))
        )}
      </Card>

      {visible && (
        <Config
          onClose={() => {
            setVisible(false)
            config.getItem(undefined)
          }}
          data={config.data}
          onSubmit={(v) => {
            optConfig.addOrUpdateConfig(v, config.data?.name)
          }}
        />
      )}
      <ConfigDetail
        name={showConfigName}
        onClose={() => setShowConfigName(undefined)}
      />
    </>
  )
}

export default ConfigList
