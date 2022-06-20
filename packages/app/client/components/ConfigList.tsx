import { Avatar, Button, List, message, Skeleton } from 'antd'
import { TConfig, TListItem } from '../../types/shim'
import { useEffect, useState } from 'react'
import Config from './Config.js'
import { configService } from '../service/index.js'

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
    if (!addOrEditResult.isValidating && addOrEditResult.data) {
      listResult.mutate()
      setVisible(false)
      setConfig(undefined)
    }
  }, [addOrEditResult.isValidating, addOrEditResult.data])
  useEffect(() => {
    if (!detailResult.isValidating && detailResult.data) {
      if (getParam) {
        const edit: TConfig = {
          detail: detailResult.data,
          name: getParam.name,
          description: getParam.description,
        }
        setVisible(true)
        setEdit(edit)
      }
      setGetParam(undefined)
    }
  }, [detailResult.isValidating, detailResult.data])

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
              <Button
                type="link"
                onClick={() => {
                  setGetParam(item)
                }}
              >
                编辑
              </Button>,
              <Button type="link">删除</Button>,
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
