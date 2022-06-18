import { checkPathExist, warning } from '../utils/index.js'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function get<T>(configPath: string) {
  warning(!!configPath, '必须指定配置文件')
  configPath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath)
  warning(!(await checkPathExist(configPath)), '指定的配置文件不存在')
  const config = (await import(pathToFileURL(configPath).href)).default as T
  return config
}

export default get
