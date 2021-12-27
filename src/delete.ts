import chalk from 'chalk'
import execa from 'execa'
import { log } from './utils'
import deleteEmptyDir from './utils/deleteEmptyDir'
import getDeleteList from './utils/getDeleteList'

/**
 *
 * @param source 源地址
 * @param dest 目标地址
 */
async function deleteLinks(source: string, dest: string) {
  const deleteList = getDeleteList(source, dest)
  log.info('开始执行删除:')
  log.info('源地址:', chalk.cyan(source))
  log.info('目标地址:', chalk.cyan(dest))
  if (deleteList.length) {
    log.info('找到可以删除的硬链', deleteList.length, '个')
    await execa('rm', deleteList)
    await deleteEmptyDir(dest) // 清除空文件夹
    log.success('硬链接全部删除完成')
  } else {
    log.info('没有找到相关的硬链')
  }
}

export default deleteLinks
