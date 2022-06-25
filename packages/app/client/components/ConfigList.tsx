import { Button, Card, List, Popconfirm, Tooltip } from 'antd'
import { TConfig } from '../../types/shim'
import { useState } from 'react'
import Config from './Config.js'
import { configService } from '../service/index.js'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

const Item = List.Item

function ConfigList() {
  const [visible, setVisible] = useState(false)
  const [edit, setEdit] = useState<TConfig>()
  const listResult = configService.useList()
  const optConfig = configService.useAddOrEdit({
    onSuccess() {
      setVisible(false)
      listResult.mutate()
    },
  })
  const config = configService.useGet({
    onSuccess(data) {
      setEdit(data)
      setVisible(true)
    },
  })
  const deleteConfig = configService.useDelete({
    onSuccess() {
      listResult.mutate()
    },
  })

  return (
    <>
      <Card
        className="bg-white px-2"
        title={<div className="font-600 text-size-lg">配置列表</div>}
        extra={
          <Button
            type="primary"
            onClick={() => {
              setVisible(true)
            }}
          >
            创建配置
          </Button>
        }
      >
        {listResult.data?.map((item) => (
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

              <Popconfirm
                title="确认删除此配置文件?"
                onConfirm={() => {
                  deleteConfig.rmItem(item.name)
                }}
                okText="是"
                cancelText="否"
              >
                <Tooltip title="删除">
                  <Button
                    type="link"
                    shape="circle"
                    // @ts-ignore
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>,
            ]}
          >
            <Item.Meta
              title={item.name}
              description={item.description || item.name}
            />
          </Item>
        ))}
      </Card>

      {visible && (
        <Config
          visible
          onClose={() => {
            setVisible(false)
          }}
          data={edit}
          onSubmit={(v) => {
            optConfig.addOrUpdateConfig(v, edit && edit.name)
          }}
        />
      )}
    </>
  )
}

export default ConfigList
