import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { execaSync } from 'execa'
import fs from 'fs-extra'
import { log } from '@hlink/core'

const currentDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const cli = process.env.NODE_ENV === 'development' ? 'cli-dev.js' : 'cli.js'
function check() {
  execaSync('type', ['hlink'])
  log.info('如果看到这个消息，说明hlink已经安装成功并已经添加到环境变量中')
  log.info(`你可以使用 ${chalk.cyan('hlink --help')} 查看帮助文档`)
  log.info(`有任何问题，还原到qq群反馈，群号${chalk.cyan('807101297')}`)
}

function doctor() {
  try {
    check()
  } catch (e) {
    log.warn('检查到hlink没有添加到环境变量中, 开始为你自动添加')
    try {
      fs.ensureDirSync('/usr/local/bin')
      execaSync('ln', [
        '-s',
        path.resolve(currentDir, cli),
        '/usr/local/bin/hlink',
      ])
      execaSync('chmod', ['+x', path.resolve(currentDir, cli)])
      log.success('添加到环境变量成功~')
      check()
    } catch (e) {
      console.log(e)
      // 自动创建hlink硬链失败
      log.error('抱歉添加hlink到环境变量失败了，请手动添加~')
      log.info('如何添加环境变量请自行搜索~')
      const full = currentDir
      log.info(
        '或者你可以全局路径使用hlink, 路径为',
        chalk.cyan(path.resolve(full, '../../../../bin/hlink'))
      )
    }
  }
}

export default doctor
