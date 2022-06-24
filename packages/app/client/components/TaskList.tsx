import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FullscreenOutlined,
  LinkOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import LinkSvg from '../icons/link.svg'
import SyncSvg from '../icons/sync.svg'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  List,
  message,
  Popconfirm,
  Row,
  Skeleton,
  Tooltip,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { TTask } from '../../types/shim'
import { configService, taskService } from '../service'
import Task from './Task'

const Meta = Card.Meta

const Item = List.Item
function TaskList() {
  const [visible, setVisible] = useState(false)
  const [edit, setEdit] = useState<TTask>()
  const list = taskService.useList()
  const configList = configService.useList()
  const optTask = taskService.useAddOrEdit({
    onSuccess() {
      list.mutate()
      setVisible(false)
    },
  })
  const task = taskService.useGet({
    onSuccess(data) {
      setVisible(true)
      setEdit(data)
    },
  })
  const deleteResult = taskService.useDelete({
    onSuccess() {
      list.mutate()
    },
  })
  return (
    <>
      <Card
        className="bg-white px-2"
        title={<div className="font-600 text-size-lg">任务列表</div>}
        extra={
          <Button
            type="primary"
            onClick={() => {
              if (configList?.data?.length) {
                setVisible(true)
              } else {
                message.info('请先创建配置')
              }
            }}
          >
            创建任务
          </Button>
        }
      >
        <Row gutter={[20, 6]}>
          {list.data?.map((item) => {
            const text =
              item.type === 'main'
                ? '硬链'
                : item.reverse
                ? '反向同步'
                : '正向同步'
            const color =
              item.type === 'main'
                ? '#08b'
                : item.reverse
                ? '反向同步'
                : '#d4237a'

            const [configName, configDescription] = item.config.split('-')
            return (
              <Col
                span={24}
                md={{ span: 12 }}
                lg={{ span: 8 }}
                xl={{ span: 6 }}
                key={item.name}
              >
                <Badge.Ribbon text={text} color={color}>
                  <Card
                    actions={[
                      <Popconfirm
                        title="确认删除此任务?"
                        onConfirm={() => {
                          deleteResult.rmItem(item.name)
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
                      <Tooltip title="编辑">
                        <Button
                          type="link"
                          onClick={() => {
                            task.getItem(item.name)
                          }}
                          shape="circle"
                          // @ts-ignore
                          icon={<EditOutlined key="edit" />}
                        />
                      </Tooltip>,
                      <Tooltip title="配置详情">
                        <Button
                          type="link"
                          onClick={() => {
                            console.log('detail')
                          }}
                          // @ts-ignore
                          icon={<FullscreenOutlined key="detail" />}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <Meta
                      avatar={
                        <Avatar
                          src={item.type === 'main' ? LinkSvg : SyncSvg}
                        />
                      }
                      title={item.name}
                      description={
                        <>
                          配置文件:
                          <div>
                            <b>{configName}.mjs</b>
                          </div>
                          配置名称:
                          <div>
                            <b>{configDescription}</b>
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Badge.Ribbon>
              </Col>
            )
          })}
        </Row>
      </Card>
      {visible && (
        <Task
          edit={edit}
          onClose={() => {
            setVisible(false)
          }}
          onSubmit={(v) => {
            optTask.addOrUpdateTask(v, edit?.name)
          }}
        />
      )}
    </>
  )
}

export default TaskList
