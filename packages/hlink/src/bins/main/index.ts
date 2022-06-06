import chalk from 'chalk'
import fs from 'fs-extra'
import hlink from './hlink.js'
import helpText from './help.js'
import { log } from '../../utils.js'
import { configPath, configName } from '../../paths.js'
import path from 'path'
import createConfig from './createConfig.js'

export type Flags = Omit<IHlink.Flags, 'watch' | 'all'>

export default (inputs: string[], flags: Flags) => {
  if (flags.help) {
    console.log(helpText)
  } else if (flags.removeConfig) {
    const _configPath = flags.configPath || configPath
    if (fs.existsSync(_configPath)) {
      fs.unlinkSync(_configPath)
      log.success(`移除配置文件成功,${_configPath}\n`)
    } else {
      log.warn(`没有找到 ${chalk.cyan(_configPath)}，无需删除配置文件\n`)
    }
  } else if ('generateConfig' in flags) {
    const configPath = path.isAbsolute(flags.generateConfig)
      ? path.join(flags.generateConfig, configName)
      : path.join(process.cwd(), flags.generateConfig, configName)
    createConfig(!!flags.generateConfig && configPath)
  } else {
    global.printOnExit = () => {
      log.info('手动打断硬链过程，不会保存硬链记录')
    }
    hlink(inputs, flags)
  }
}
