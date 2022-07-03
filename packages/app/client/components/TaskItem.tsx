import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  FullscreenOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Card, message, Popconfirm } from 'antd'
import { useEffect, useState } from 'react'
import copy from 'copy-to-clipboard'
import cls from 'classnames'
import { TTask } from '../../types/shim'
import { isMobile } from '../kit'
import Tooltip from './Tooltip'
import LinkSvg from '../icons/link.svg'
import SyncSvg from '../icons/sync.svg'

const Meta = Card.Meta
type TProps = {
  data: TTask
  index: number
  onEdit: (name: string) => void
  onDelete: (name: string) => void
  onShowConfig: (config: string) => void
  onSetSchedule: (name: string) => void
  onCancelSchedule: (name: string) => void
  onPlay: (name: string) => void
}

function TaskItem(props: TProps) {
  const [showPlayIndex, setShowPlayIndex] = useState(-1)
  const {
    data,
    index,
    onEdit,
    onDelete,
    onShowConfig,
    onSetSchedule,
    onPlay,
    onCancelSchedule,
  } = props

  const text =
    data.type === 'main' ? '硬链' : data.reverse ? '反向同步' : '正向同步'
  const color = data.type === 'main' ? '#08b' : '#d4237a'
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
    <Badge.Ribbon text={text} color={color}>
      <Card
        hoverable={!isMobile()}
        onMouseLeave={() => {
          if (!isMobile()) {
            setShowPlayIndex(-1)
          }
        }}
        className={cls({
          'hlink-hover': index === showPlayIndex,
        })}
        actions={[
          <Tooltip title="编辑">
            <Button
              type="link"
              onClick={() => {
                onEdit(data.name)
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
                onDelete(data.name)
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
                onShowConfig(data.config)
              }}
              // @ts-ignore
              icon={<FullscreenOutlined key="detail" />}
            />
          </Tooltip>,
          data.type === 'main' && (
            <Tooltip title="复制脚本，用于下载完成时触发">
              <Button
                type="link"
                onClick={() => {
                  if (
                    copy(
                      `curl ${
                        location.origin
                      }/api/task/run?name=${encodeURIComponent(
                        data.name
                      )}&alive=0`,
                      {
                        debug: true,
                        message: 'Press #{key} to copy',
                      }
                    )
                  ) {
                    message.success('复制成功，快去设置吧')
                  }
                }}
                // @ts-ignore
                icon={<CopyOutlined key="copy" />}
              />
            </Tooltip>
          ),
          !data.scheduleType && (
            <Tooltip title="设置定时任务">
              <Button
                type="link"
                onClick={() => {
                  onSetSchedule(data.name)
                }}
                // @ts-ignore
                icon={<FieldTimeOutlined key="time" />}
              />
            </Tooltip>
          ),
          !!data.scheduleType && (
            <Tooltip title="取消定时任务">
              <Popconfirm
                placement="right"
                title="确认取消定时任务?"
                onConfirm={() => {
                  onCancelSchedule(data.name)
                }}
                okText="是"
                cancelText="否"
              >
                <Button
                  type="link"
                  // @ts-ignore
                  icon={<PoweroffOutlined key="off" />}
                />
              </Popconfirm>
            </Tooltip>
          ),
        ].filter(Boolean)}
      >
        <div
          onClick={() => {
            setShowPlayIndex(index)
          }}
          onMouseOver={() => {
            if (!isMobile()) {
              setShowPlayIndex(index)
            }
          }}
        >
          <Meta
            avatar={<Avatar src={data.type === 'main' ? LinkSvg : SyncSvg} />}
            title={data.name}
            description={
              <div className="h-66px">
                配置:{' '}
                <b className={cls({ block: !data.scheduleType })}>
                  {data.config}
                </b>
                {!!data.scheduleType && (
                  <div>
                    已设置定时任务:
                    <div className="font-bold">
                      {data.scheduleType}(
                      {data.scheduleType === 'cron'
                        ? data.scheduleValue
                        : `每${data.scheduleValue}秒执行一次`}
                      )
                    </div>
                  </div>
                )}
              </div>
            }
          />
        </div>
        <div className="bg-black op-0 absolute z-24 hlink-mask"></div>
        <PlayCircleOutlined
          onClick={() => {
            onPlay(data.name)
          }}
          className="hidden text-5xl absolute left-50% top-50% op-0 -ml-6 -mt-6 z-25 hlink-play"
          color="#ddd"
        />
      </Card>
    </Badge.Ribbon>
  )
}

export default TaskItem
