interface IConfig {
  message: string
  default?: boolean
}

type IDone = (answer: boolean) => void

declare module '@inquirer/confirm' {
  export default function confirm(
    config: IConfig,
    done?: IDone
  ): Promise<boolean>
}
