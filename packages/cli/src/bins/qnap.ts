import chalk from 'chalk'
import { execaSync } from 'execa'
import path from 'path'
import { log, hlinkHomeDir } from '@hlink/core'

export const backup = (_path: string) => {
  if (!_path) {
    log.warn('请输入需要备份的路径', chalk.cyan('hlink backup 路径'))
    return
  }
  execaSync('cp', ['-r', hlinkHomeDir, _path])
}

export const restore = (_path: string) => {
  if (!_path) {
    log.warn('请输入需要还原的文件路径', chalk.cyan('hlink restore 路径'))
    return
  }
  execaSync('cp', [
    '-r',
    _path.indexOf('.hlink') ? _path : path.join(_path, '.hlink'),
    path.dirname(hlinkHomeDir),
  ])
}
