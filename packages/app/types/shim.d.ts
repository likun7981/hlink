export type TConfig = {
  name: string
  description?: string
  detail: string
}

export type TListItem = Omit<TConfig, 'detail'>

export type TTask = {
  name: string
  type: 'main' | 'prune'
  config: string
  reverse?: boolean
}
