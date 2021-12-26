import chalk from 'chalk'
import execa from 'execa'
import { getDirBasePath, getLinkPath, log } from './utils'

/**
 *
 * @param sourceFile 源文件的绝对路径
 * @param originalDestPath 硬链文件实际存放的目录(绝对路径)
 * @param dest 目的地址的绝对路径
 * @param isDeleteDir 是否删除文件所在目录
 * @returns 计数
 */
function deleteLinks(
  sourceFile: string,
  originalDestPath: string,
  dest: string,
  isDeleteDir: boolean,
) {
  let jumpCount = 0
  let successCount = 0
  let failCount = 0
  try {
    const linkPaths = getLinkPath(sourceFile, dest, isDeleteDir)
    if (linkPaths.length) {
      linkPaths.forEach(removePath => {
        execa.sync('rm', ['-r', removePath])
        const deletePathMessage = chalk.cyan(getDirBasePath(dest, removePath))
        log.info(isDeleteDir ? '目录' : '硬链', deletePathMessage, '删除成功')
        successCount += 1
      })
    } else {
      jumpCount += 1
      log.warn(
        '没找到',
        chalk.yellow(getDirBasePath(dest, sourceFile)),
        '相关硬链, 跳过'
      )
    }
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'ALREADY_DELETE') {
        log.warn(
          '目录',
          chalk.yellow(getDirBasePath(dest, originalDestPath)),
          '已删除, 跳过'
        )
        jumpCount += 1
      } else {
        log.error(e)
        failCount += 1
      }
    }
  }
  return {
    jumpCount,
    failCount,
    successCount
  }
}

export default deleteLinks
