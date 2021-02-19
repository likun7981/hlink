import fs, { link } from 'fs-extra'
import path from 'path'
import {
  log,
  checkLinkExist,
  getLinkPath,
  getDirBasePath,
  getRealDestPath,
  startLog,
  endLog,
  warning
} from './utils'
import execa from 'execa'
import chalk from 'chalk'
import saveRecord from './config/saveRecord'
import parse from './utils/parse'
import HlinkError from './utils/HlinkError'

const resolvePath = path.resolve

async function hardLink(input: Array<string>, options: any) {
  let isSecondDir = false
  let {
    source,
    saveMode,
    dest,
    isDelete,
    maxFindLevel,
    exts,
    excludeExts,
    sourceDir,
    isDeleteDir
  } = await parse(input, options)
  const isWhiteList = !!exts.length
  startLog(
    {
      extname: isWhiteList ? exts : excludeExts,
      maxLevel: maxFindLevel,
      saveMode,
      source,
      dest
    },
    isWhiteList,
    isDelete
  )
  let successCount = 0
  let jumpCount = 0
  let failCount = 0
  let totalCount = 0
  function start(currentDir: string, currentLevel = 1) {
    if (currentLevel > maxFindLevel) {
      return
    }
    const currentDirContents = fs.readdirSync(currentDir)
    currentDirContents.forEach(async name => {
      const extname = path
        .extname(name)
        .replace('.', '')
        .toLowerCase()
      const fileFullPath = resolvePath(currentDir, name)
      if (fs.lstatSync(fileFullPath).isDirectory()) {
        if (!name.startsWith('.')) {
          await start(fileFullPath, currentLevel + 1)
        }
        // 地址继续循环
      } else if (
        isWhiteList
          ? exts.indexOf(extname) > -1
          : excludeExts.indexOf(extname) === -1
      ) {
        totalCount += 1
        const realDestPath = getRealDestPath(
          fileFullPath,
          source,
          dest,
          saveMode
        )
        if (isDelete) {
          // 删除硬链接
          try {
            const linkPaths = getLinkPath(fileFullPath, dest, isDeleteDir)
            if (linkPaths.length) {
              linkPaths.forEach(removePath => {
                execa.sync('rm', ['-r', removePath])
                const deletePathMessage = chalk.cyan(
                  getDirBasePath(dest, removePath)
                )
                log.info(
                  isDeleteDir ? '目录' : '硬链',
                  deletePathMessage,
                  '删除成功'
                )
                successCount += 1
              })
            } else {
              jumpCount += 1
              log.warn(
                '没找到',
                chalk.yellow(getDirBasePath(dest, fileFullPath)),
                '相关硬链, 跳过'
              )
            }
          } catch (e) {
            if (e.message === 'ALREADY_DELETE') {
              log.warn(
                '目录',
                chalk.yellow(getDirBasePath(dest, realDestPath)),
                '已删除, 跳过'
              )
              jumpCount += 1
            } else {
              log.error(e)
              failCount += 1
            }
          }
        } else {
          // 做硬链接
          const sourceNameForMessage = chalk.yellow(
            getDirBasePath(source, fileFullPath)
          )
          const destNameForMessage = chalk.cyan(
            getDirBasePath(dest, path.join(realDestPath, name))
          )
          try {
            if (checkLinkExist(fileFullPath, dest)) {
              throw new HlinkError('File exists')
            } else {
              fs.ensureDirSync(realDestPath)
            }
            execa.sync('ln', [fileFullPath, realDestPath])
            log.success(
              '源地址',
              sourceNameForMessage,
              '硬链成功, 硬链地址为',
              destNameForMessage
            )
            successCount += 1
          } catch (e) {
            if (!e.stderr || e.stderr.indexOf('File exists') === -1) {
              log.error(e)
              failCount += 1
            } else {
              log.warn('源地址', sourceNameForMessage, '硬链已存在, 跳过创建')
              jumpCount += 1
            }
          }
        }
      } else {
        totalCount += 1
        log.warn('当前文件', chalk.yellow(name), '不满足配置条件, 跳过创建')
        jumpCount += 1
      }
    })
  }
  start(source)
  saveRecord(sourceDir, dest, isDelete && !isSecondDir)
  endLog(successCount, failCount, jumpCount, totalCount, isDelete)
}

export default hardLink
