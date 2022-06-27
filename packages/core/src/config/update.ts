import { chalk, checkPathExist, log, warning } from '../utils/index.js'
import fs from 'fs-extra'

async function update(configPath: string, detail: string) {
  warning(!configPath, '必须指定要更新的配置文件')
  warning(
    !(await checkPathExist(configPath)),
    `配置文件${chalk.cyan(configPath)}不存在`
  )
  warning(!detail, '必须指定要更新的内容')
  try {
    await fs.writeFile(configPath, detail)
    log.success('配置文件更新成功, 路径为', chalk.cyan(configPath))
    console.log()
  } catch (e) {
    log.error('配置文件更新失败', e)
  }
}

export default update
