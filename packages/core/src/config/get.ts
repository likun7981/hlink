import { checkPathExist, warning } from '../utils/index.js'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { configPath as defaultConfigPath } from '../utils/paths.js'

async function get<T>(configPath: string) {
  configPath = configPath || defaultConfigPath
  configPath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath)
  warning(!(await checkPathExist(configPath)), '指定的配置文件不存在')
  const config = (await import(pathToFileURL(configPath).href)).default as T
  return config
}

export default get
