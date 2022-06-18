import chalk from 'chalk'
import path from 'path'
import confirm from '@inquirer/confirm'
import {
  createTimeLog,
  findParentRelative,
  log,
  rmFiles,
} from '../utils/index.js'
import deleteEmptyDir from './deleteEmptyDir.js'
import getRmFiles from './getRmFiles.js'
import formatConfig from '../config/format.js'

const timeLog = createTimeLog()

export interface IOptions extends IHlink.Options {
  /**
   * @description 是否删除文件所在目录
   */
  deleteDir?: boolean
  /**
   * @description 删除时是否二次确认
   */
  withoutConfirm?: boolean
  /**
   * @description 是否是反向检测
   */
  reverse?: boolean
}

async function prune(options: IOptions) {
  const {
    exclude,
    withoutConfirm,
    include,
    reverse = false,
    pathsMapping = {},
    deleteDir = false,
  } = await formatConfig(options)
  const sourcePaths = Object.keys(pathsMapping)
  const destPaths = Object.values(pathsMapping)
  timeLog.start()
  const sourceArr = sourcePaths.map((s) => path.resolve(s))
  const destArr = destPaths.map((d) => path.resolve(d))
  const relativePaths = findParentRelative([...sourceArr, ...destArr])
  log.info('开始执行...')
  log.info('源目录有:')
  sourceArr.forEach((s, i) => {
    console.log('', chalk.gray(relativePaths[i]))
  })
  console.log()
  log.info('硬链目录有:')
  destArr.forEach((d, i) => {
    console.log('', chalk.gray(relativePaths.slice(sourceArr.length)[i]))
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
    chalk.magenta(deleteDir ? '删除硬链所在目录' : '仅仅删除硬链文件')
  )
  log.info('包含的匹配规则', chalk.magenta(include.join(',')))
  log.info(
    '排除的匹配规则',
    chalk.magenta(exclude.length ? exclude.join(',') : '无')
  )
  log.info('开始分析目录集合...')
  const pathsNeedDelete = await getRmFiles({
    sourceArr,
    destArr,
    include,
    exclude,
    deleteDir,
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
