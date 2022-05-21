import chalk from 'chalk'
import { fileRecord, newFileRecord } from '../paths.js'
import { findParent, log } from '../utils.js'

function rebuild() {
  if (fileRecord.exist()) {
    log.info('由于历史记录数据结构(非缓存)有变更，所以需要导入旧的历史记录')
    log.info('开始导入..')
    try {
      const preRecord = fileRecord.read();
      fileRecord.backup()
      const newRecord = preRecord.map(item => {
        return {
          inode: item.inode,
          dest: findParent(item.dest),
          source: findParent(item.source)
        }
      })
      newFileRecord.write(newRecord)
      fileRecord.rm(true)
      log.success('导入历史记录成功')
    } catch (e) {
      console.log(e);
      log.error(
        `导入历史创建记录失败, 请使用 ${chalk.cyan('hlink rebuild')} 手动导入!`
      )
      fileRecord.restore()
    }
  }
}

export default rebuild
