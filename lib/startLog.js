const log = require('./log')
const chalk = require('chalk')

module.exports = (options, isDelete) => {
  const messageMap = {
    e: '  包含的额外后缀有：',
    m: '  源地址最大查找层级为：',
    s: '  硬链保存模式：'
  }
  if (!isDelete) {
    log.info('开始创建硬链...')
    log.info('当前配置为:')
    Object.keys(messageMap).forEach(k => {
      if (options[k]) {
        log.info(`${messageMap[k]}${chalk.cyanBright(options[k])}`)
      }
    })
  } else {
    log.info('开始删除硬链...')
  }
}
