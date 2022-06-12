import { Avatar, Button, List, Skeleton } from 'antd'
import { TConfig } from '../../types/shim'

type TProps = {
  data: TConfig[]
  onEditor: (data: TConfig) => void
}

const Item = List.Item

function ConfigList(props: TProps) {
  const { onEditor } = props
  return (
    <List
      header={<div className="font-600 text-size-lg">配置文件列表</div>}
      className="bg-white px-2"
      dataSource={props.data}
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
