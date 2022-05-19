interface IConfig {
  message: string
  default?: boolean
}

declare module '@inquirer/confirm' {
  export default function confirm(config: IConfig, done?: IDone): Promise<boolean>
}
