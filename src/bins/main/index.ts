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
    const _configPath = flags.configPath || configPath
    if (fs.existsSync(_configPath)) {
      fs.unlinkSync(_configPath)
      log.success(`移除配置文件成功,${_configPath}\n`)
    } else {
      log.warn('您并没有创建配置文件\n')
    }
  } else if ('g' in flags) {
    const configPath = path.isAbsolute(flags.generateConfig)
      ? path.join(flags.generateConfig, configName)
      : path.join(process.cwd(), flags.generateConfig, configName)
    createConfig(!!flags.generateConfig && configPath)
  } else {
    global.printOnExit = () => {
      log.info('手动打断硬链过程，不会保存缓存')
    }
    hlink(inputs, flags)
  }
}
