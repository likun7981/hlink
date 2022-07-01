import {
  DeleteOutlined,
  EditOutlined,
  FullscreenOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import './TaskList.less'
import LinkSvg from '../icons/link.svg'
import SyncSvg from '../icons/sync.svg'
import cls from 'classnames'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { configService, taskService } from '../service'
import Task from './Task'
import ConfigDetail from './ConfigDetail'
import { isMobile } from '../kit'
import Tooltip from './Tooltip'
import RunDetail from './RunDetail'

const Meta = Card.Meta

function TaskList() {
  const [visible, setVisible] = useState(false)
  const [showPlayIndex, setShowPlayIndex] = useState(-1)
  const [showConfigName, setShowConfigName] = useState<string>()
  const [runTaskName, setRunTaskName] = useState<string>()
  const list = taskService.useList()
  const configList = configService.useList()
  const optTask = taskService.useAddOrEdit({
    onSuccess() {
      list.mutate()
      setVisible(false)
    },
  })
  const task = taskService.useGet({
    onSuccess() {
      setVisible(true)
    },
  })
  const deleteResult = taskService.useDelete({
    onSuccess() {
      list.mutate()
    },
  })
  useEffect(() => {
    let timeout: number
    if (showPlayIndex !== -1 && isMobile()) {
      timeout = window.setTimeout(() => {
        setShowPlayIndex(-1)
      }, 2000)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [showPlayIndex])
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
          {list.data?.map((item, i) => {
            const text =
              item.type === 'main'
                ? '硬链'
                : item.reverse
                ? '反向同步'
                : '正向同步'
            const color = item.type === 'main' ? '#08b' : '#d4237a'

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
                    hoverable={!isMobile()}
                    onMouseLeave={() => {
                      if (!isMobile()) {
                        setShowPlayIndex(-1)
                      }
                    }}
                    className={cls({
                      'hlink-hover': i === showPlayIndex,
                    })}
                    actions={[
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
                      <Tooltip title="删除">
                        <Popconfirm
                          placement="right"
                          title="确认删除此任务?"
                          onConfirm={() => {
                            deleteResult.rmItem(item.name)
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
                            setShowConfigName(item.config)
                          }}
                          // @ts-ignore
                          icon={<FullscreenOutlined key="detail" />}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <div
                      onClick={() => {
                        setShowPlayIndex(i)
                      }}
                      onMouseOver={() => {
                        if (!isMobile()) {
                          setShowPlayIndex(i)
                        }
                      }}
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
                              <b>{item.config}</b>
                            </div>
                          </>
                        }
                      />
                    </div>
                    <div className="bg-black op-0 absolute z-24 hlink-mask"></div>
                    <PlayCircleOutlined
                      onClick={() => {
                        setRunTaskName(item.name)
                      }}
                      className="hidden text-5xl absolute left-50% top-50% op-0 -ml-6 -mt-6 z-25 hlink-play"
                      color="#ddd"
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
          edit={task.data}
          onClose={() => {
            task.getItem(undefined)
            setVisible(false)
          }}
          onSubmit={(v) => {
            optTask.addOrUpdateTask(v, task.data?.name)
          }}
        />
      )}
      <ConfigDetail
        name={showConfigName}
        onClose={() => setShowConfigName(undefined)}
      />
      <RunDetail
        name={runTaskName}
        onClose={() => {
          setRunTaskName(undefined)
        }}
      />
    </>
  )
}

export default TaskList
