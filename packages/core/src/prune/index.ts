import chalk from 'chalk'
import path from 'path'
import confirm from '@inquirer/confirm'
import { createTimeLog, log, rmFiles, warning } from '../utils/index.js'
import defaultInclude from '../utils/defaultInclude.js'
import deleteEmptyDir from './deleteEmptyDir.js'
import getGlobs from './getGlobs.js'
import getRmFiles from './getRmFiles.js'

const timeLog = createTimeLog()

export type TOptions = {
  /**
   * @description 原路径和目标路劲的映射关系
   */
  pathsMapping?: Record<string, string>
  /**
   * @description 是否删除文件所在目录
   */
  rmDir?: boolean
  /**
   * @description 删除时是否二次确认
   */
  withoutConfirm?: boolean
  /**
   * @description 是否是反向检测
   */
  reverse?: boolean
  /**
   * @description 包含
   */
  include?: IHlink.Options['include']
  /**
   * @description 排除
   */
  exclude?: IHlink.Options['exclude']
}

async function prune(options: TOptions) {
  const {
    exclude = {},
    withoutConfirm,
    include = {},
    reverse = false,
    pathsMapping = {},
    rmDir = false,
  } = options
  const sourcePaths = Object.keys(pathsMapping)
  const destPaths = Object.values(pathsMapping)
  warning(
    !sourcePaths.length || !destPaths.length,
    '必须指定要检测的源目录和硬链目录集合'
  )
  const includeGlobs = getGlobs(include, defaultInclude.split(','))
  const excludeGlobs = getGlobs(exclude)
  timeLog.start()
  const sourceArr = sourcePaths.map((s) => path.resolve(s))
  const destArr = destPaths.map((d) => path.resolve(d))
  log.info('开始执行...')
  log.info('指定的源目录有:')
  sourceArr.forEach((s) => {
    console.log('', chalk.gray(s))
  })
  console.log()
  log.info('指定的硬链目录有:')
  destArr.forEach((d) => {
    console.log('', chalk.gray(d))
  })
  console.log()
  log.info(
    '检测模式:',
    chalk.magenta(
      reverse
        ? '反向检测，删除源目录比硬链目录多的文件，hlink会帮你排除缓存的文件'
        : '正向检测，删除硬链目录比源目录多的文件'
    )
  )
  log.info(
    '删除模式:',
    chalk.magenta(rmDir ? '删除硬链所在目录' : '仅仅删除硬链文件')
  )
  log.info('包含的匹配规则', chalk.magenta(includeGlobs.join(',')))
  log.info('排除的匹配规则', chalk.magenta(excludeGlobs.join(',')))
  log.info('开始分析目录集合...')
  const pathsNeedDelete = getRmFiles({
    sourceArr,
    destArr,
    include: includeGlobs,
    exclude: excludeGlobs,
    rmDir,
    reverse,
  })
  log.info('分析完毕')
  if (pathsNeedDelete.length) {
    log.info(
      `共计找到 ${chalk.cyan(pathsNeedDelete.length)} 个路径需要删除，列表如下`
    )
    pathsNeedDelete.forEach((file) => {
      console.log('', chalk.gray(file))
    })
    console.log()
    let answer = true
    if (!withoutConfirm && process.stdout.isTTY) {
      answer = await confirm({
        message: '确认是否继续？删除后无法恢复',
        default: false,
      })
    }
    if (answer) {
      await rmFiles(pathsNeedDelete)
      await deleteEmptyDir(pathsNeedDelete)
      log.success('删除完成')
    } else {
      log.info('已终止任务')
    }
  } else {
    log.info('没有找到需要修剪的硬链，你的目录保持很干净')
  }
  timeLog.end()
}

export default prune
