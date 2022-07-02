export type TConfig = {
  name: string
  description?: string
  detail?: string
  configPath: string
}

export type TTask = {
  name: string
  type: TTaskType
  config: string
  reverse?: boolean
  scheduleType?: 'cron' | 'loop'
  scheduleValue?: string
}

export type TSchedule = Required<
  Pick<TTask, 'name' | 'scheduleType' | 'scheduleValue'>
>

export type TTaskStatus = 'succeed' | 'failed' | 'ongoing'
export type TTaskType = 'main' | 'prune'

export type TSendData = {
  status: TTaskStatus
  type: TTaskType
  output?: string
  confirm?: boolean
}

export interface SSELog {
  send?: (data: TSendData) => void
  sendEnd?: () => void
}

declare module 'koa' {
  interface BaseContext extends SSELog {
    withSSE: true
  }
}
