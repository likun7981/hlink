import { Avatar, Button, List, Skeleton } from 'antd'
import useSWR from 'swr'
import fetch from '../kit/fetch.js'
import { TConfig } from '../../types/shim'

type Item = Omit<TConfig, 'detail'>

type TProps = {
  onEditor: (data: Item) => void
}

const Item = List.Item

function ConfigList(props: TProps) {
  const { onEditor } = props
  const { data, error } = useSWR(
    '/api/config/list',
    (url) => fetch.get<Omit<Item, 'detail'>[]>(url),
    {
      suspense: true,
      onSuccess(data) {
        console.log(data)
      },
    }
  )
  return (
    <List
      header={<div className="font-600 text-size-lg">配置文件列表</div>}
      className="bg-white px-2"
      dataSource={data || []}
      renderItem={(item) => (
        <Item
          actions={[
            <Button type="link" onClick={() => onEditor(item)}>
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
  )
}

export default ConfigList
