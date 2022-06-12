import { Avatar, Button, List, Skeleton } from 'antd'
import { TConfig } from '../types/shim'

type TProps = {
  data: TConfig[]
}

const Item = List.Item

function ConfigList(props: TProps) {
  return (
    <List
      header={<div className="font-600 text-size-lg">任务列表</div>}
      className="bg-white px-2"
      dataSource={props.data}
      renderItem={(item) => (
        <Item
          actions={[
            <Button type="link">编辑</Button>,
            <Button type="link">删除</Button>,
          ]}
        >
          <Item.Meta title={item.name} description={item.description} />
        </Item>
      )}
    ></List>
  )
}

export default ConfigList
