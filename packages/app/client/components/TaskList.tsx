import './TaskList.less'
import { Button, Card, Col, message, Row, Empty } from 'antd'
import React, { useState } from 'react'
import { configService, taskService } from '../service'
import Task from './Task'
import ConfigDetail from './ConfigDetail'
import RunDetail from './RunDetail'
import TaskItem from './TaskItem'

function TaskList() {
  const [visible, setVisible] = useState(false)
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

  const handleCreate = () => {
    if (configList?.data?.length) {
      setVisible(true)
    } else {
      message.info('请先创建配置')
    }
  }
  return (
    <>
      <Card
        className="bg-white px-2"
        title={<div className="font-600 text-size-lg">任务列表</div>}
        extra={
          !!list.data?.length && (
            <Button type="primary" onClick={handleCreate}>
              创建任务
            </Button>
          )
        }
      >
        {!list.data?.length ? (
          <Empty description="暂无任务">
            <Button type="primary" size="small" onClick={handleCreate}>
              立即创建
            </Button>
          </Empty>
        ) : (
          <Row gutter={[20, 6]}>
            {list.data?.map((item, i) => {
              return (
                <Col
                  span={24}
                  md={{ span: 12 }}
                  lg={{ span: 8 }}
                  xl={{ span: 6 }}
                  key={item.name}
                >
                  <TaskItem
                    data={item}
                    index={i}
                    onEdit={(name) => task.getItem(name)}
                    onDelete={(name) => deleteResult.rmItem(name)}
                    onPlay={(name) => setRunTaskName(name)}
                    onSetSchedule={(name) => console.log(name)}
                    onShowConfig={(config) => setShowConfigName(config)}
                  />
                </Col>
              )
            })}
          </Row>
        )}
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
