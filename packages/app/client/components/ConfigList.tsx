import { Avatar, Button, List, message, Skeleton, Tooltip } from 'antd'
import { TConfig, TListItem } from '../../types/shim'
import { useEffect, useState } from 'react'
import Config from './Config.js'
import { configService } from '../service/index.js'
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'

const Item = List.Item

function ConfigList() {
  const [visible, setVisible] = useState(false)
  const [edit, setEdit] = useState<TConfig>()
  const [config, setConfig] = useState<TConfig>()
  const [getParam, setGetParam] = useState<TListItem>()
  const addOrEditResult = configService.useAddOrEdit({
    newConfig: config,
    currentConfig: edit,
  })
  const detailResult = configService.useGet({
    params: getParam,
  })
  const listResult = configService.useList()

  useEffect(() => {
    if (addOrEditResult.data) {
      listResult.mutate()
      setVisible(false)
      setConfig(undefined)
    }
  }, [addOrEditResult.data])
  useEffect(() => {
    if (detailResult.data) {
      if (getParam) {
        const edit: TConfig = {
          detail: detailResult.data,
          name: getParam.name,
          description: getParam.description,
        }
        setVisible(true)
        setEdit(edit)
        setGetParam(undefined)
      }
    }
  }, [detailResult.data])

  return (
    <>
      <List
        header={
          <div className="flex justify-between">
            <div className="font-600 text-size-lg">配置文件列表</div>
            <Button
              type="primary"
              onClick={() => {
                setEdit(undefined)
                setVisible(true)
              }}
            >
              创建配置
            </Button>
          </div>
        }
        className="bg-white px-2"
        dataSource={listResult.data || []}
        renderItem={(item) => (
          <Item
            actions={[
              <Tooltip title="以该配置执行硬链任务">
                <Button
                  type="link"
                  shape="circle"
                  // @ts-ignore
                  icon={<PlayCircleOutlined />}
                />
              </Tooltip>,
              <Tooltip title="编辑">
                <Button
                  type="link"
                  onClick={() => {
                    setGetParam(item)
                  }}
                  shape="circle"
                  // @ts-ignore
                  icon={<EditOutlined />}
                />
              </Tooltip>,
              <Tooltip title="删除">
                <Button
                  type="link"
                  onClick={() => {
                    console.log('删除')
                  }}
                  shape="circle"
                  // @ts-ignore
                  icon={<DeleteOutlined />}
                />
              </Tooltip>,
            ]}
          >
            <Item.Meta
              title={item.description || item.name}
              description={item.name}
            />
          </Item>
        )}
      ></List>
      {visible && (
        <Config
          visible
          onClose={() => {
            setVisible(false)
          }}
          data={edit}
          onSubmit={(v) => {
            setConfig(v)
          }}
        />
      )}
    </>
  )
}

export default ConfigList
