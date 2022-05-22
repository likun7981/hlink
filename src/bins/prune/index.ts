import chalk from 'chalk'
import path from 'path'
import confirm from '@inquirer/confirm'
import parseLsirf from '../../core/parseLsirf.js'
import { createTimeLog, log, makeOnly, rmFiles, warning } from '../../utils.js'
import helpText from './help.js'

const timeLog = createTimeLog()
export type Flags = Pick<IHlink.Flags, 'help' | 'pruneDir' | 'withoutConfirm'>

async function prune(sourceStr: string, destStr: string, flags: Flags) {
  const { help, pruneDir, withoutConfirm } = flags
  if (help) {
    console.log(helpText)
    process.exit(0)
  }
  warning(!sourceStr || !destStr, '必须指定要检测的源目录和硬链目录集合')
  timeLog.start()
  const sourceArr = sourceStr.split(',').map((s) => path.resolve(s))
  const destArr = destStr.split(',').map((d) => path.resolve(d))
  log.info('开始执行...')
  log.info('指定的源目录有:')
  sourceArr.forEach(s => {
    console.log('', chalk.gray(s))
  })
  console.log()
  log.info('指定的硬链目录有:')
  destArr.forEach(d => {
    console.log('', chalk.gray(d))
  })
  console.log()
  log.info(
    '删除模式:',
    chalk.magenta(pruneDir ? '删除硬链所在目录' : '仅仅删除硬链文件')
  )
  log.info('开始分析目录集合...')
  const inodes = makeOnly(
    sourceArr.reduce<string[]>(
      (result, source) =>
        result.concat(parseLsirf(source, true).map(a => a.inode)),
      []
    )
  )
  let pathsNeedDelete = makeOnly(
    destArr.reduce<string[]>(
      (result, dest) =>
        result.concat(
          parseLsirf(dest, true)
            .filter(item => !inodes.includes(item.inode))
            .map(item =>
              pruneDir
                ? path.join(path.dirname(item.fullPath), '/')
                : item.fullPath
            )
        ),
      []
    )
  )
  log.info('分析完毕')
  if (pathsNeedDelete.length) {
    // 如果是删除目录，则直接过滤掉二级目录
    if (pruneDir) {
      pathsNeedDelete = pathsNeedDelete.filter(p1 =>
        pathsNeedDelete.every(p2 => !(p1.indexOf(p2) === 0 && p1 !== p2))
      )
    }
    log.info(
      `共计找到 ${chalk.cyan(pathsNeedDelete.length)} 个路劲需要删除，列表如下`
    )
    pathsNeedDelete.forEach(file => {
      console.log('', chalk.gray(file))
    })
    console.log()
    let answer = true
    if (!withoutConfirm) {
      answer = await confirm({
        message: '确认是否继续？删除后无法恢复',
        default: false
      })
    }
    if (answer) {
      await rmFiles(pathsNeedDelete)
      log.success('删除完成')
    } else {
      log.info('已终止任务')
    }
  } else {
    log.info('没有找到需要修剪的硬链，你的目录保持很干净')
  }
}

export default prune
