import {
  checkPathExist,
  warning,
  configPath as defaultConfigPath,
} from '@hlink/core'
import path from 'path'
import { pathToFileURL } from 'url'

async function getConfig<T>(configPath: string) {
  configPath = configPath || defaultConfigPath
  configPath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath)
  warning(!(await checkPathExist(configPath)), '指定的配置文件不存在')
  const config = (await import(pathToFileURL(configPath).href)).default as T
  return config
}

export default getConfig
