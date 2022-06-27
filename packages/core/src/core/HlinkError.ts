import { chalk, log } from '../utils/index.js'

export enum ErrorCode {
  FileExists = 'FileExists',
  CrossDeviceLink = 'CrossDeviceLink',
  NotPermitted = 'NotPermitted',
}

const codeBehaviorMapping: Record<ErrorCode, () => false | string> = {
  [ErrorCode.CrossDeviceLink]: () => {
    console.log()
    log.warn('跨设备硬链,以下两种情况属于跨设备硬链:')
    log.warn(` 1. 请检查是否跨盘！`)
    log.warn(
      ` 2. 请检查是否跨越共享文件夹! 目前只支持群晖ext4才能同盘跨共享文件夹硬链`
    )
    return false
  },
  [ErrorCode.NotPermitted]: () => {
    console.log()
    log.warn('hlink没有权限')
    log.warn(` 试试使用sudo执行: ${chalk.cyan('sudo hlink xxxx')}`)
    return false
  },
  [ErrorCode.FileExists]: () => {
    return '目标地址文件已经存在'
  },
}

class HLinkError extends Error {
  public isHlinkError = true
  public code: ErrorCode
  public filepath: string
  public reason?: string
  public ignore = false
  constructor(code: ErrorCode, filepath: string, message?: string) {
    super(message)
    this.code = code
    const reason = codeBehaviorMapping[code]()
    this.filepath = filepath
    if (reason) {
      this.reason = reason
      this.ignore = true
    }
  }
}

export default HLinkError
