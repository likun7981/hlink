import hlink from './hlink.js'
import helpText from './help.js'
import fs from 'fs-extra'
import { log } from '../../utils.js'
import { configPath, configName } from '../../paths.js'
import path from 'path'
import createConfig from './createConfig.js'

export type Flags = Omit<IHlink.Flags, 'watch'>

export default (inputs: string[], flags: Flags) => {
  if (flags.help) {
    console.log(helpText)
  } else if (flags.removeConfig) {
    if (fs.existsSync(flags.configPath || configPath)) {
      fs.unlinkSync(flags.configPath || configPath)
      log.success('移除配置文件成功\n')
    } else {
      log.warn('您并没有创建配置文件\n')
    }
  } else if ('g' in flags) {
    const configPath = path.isAbsolute(flags.generateConfig)
      ? path.join(flags.generateConfig, configName)
      : path.join(process.cwd(), flags.generateConfig, configName)
    createConfig(!!flags.generateConfig && configPath)
  } else {
    hlink(inputs, flags)
  }
}
