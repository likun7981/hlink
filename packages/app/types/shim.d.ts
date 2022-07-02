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
}

export type TTaskStatus = 'succeed' | 'failed' | 'ongoing'
export type TTaskType = 'main' | 'prune'

export type TSendData = {
  status: TTaskStatus
  type: TTaskType
  output?: string
  confirm?: boolean
}

declare module 'koa' {
  interface BaseContext {
    send?: (data: TSendData) => void
    sendEnd?: () => void
  }
}

export type TSchedule = {
  type: 'cron' | 'loop'
  value: string
  name: string
}
