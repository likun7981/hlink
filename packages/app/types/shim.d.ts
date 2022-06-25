export type TConfig = {
  name: string
  description?: string
  detail?: string
  configPath: string
}

export type TTask = {
  name: string
  type: 'main' | 'prune'
  config: string
  reverse?: boolean
}
