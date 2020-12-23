const fs = require('fs-extra')
const paths = require('./configPaths')
const path = require('path')
const chalk = require('chalk')
const log = require('./log')
const warning = require('./warning')

async function createConfig () {
  if (fs.existsSync(paths.configPath)) {
    warning(fs.existsSync(paths.configPath), `配置文件已存在${chalk.cyan(paths.configPath)}，请勿重复创建`)
  };
  try {
    const content = fs.readFileSync(path.join(__dirname, './hlink.config.tpl.js'))
    fs.writeFileSync(paths.configPath, content)
    log.success('配置文件创建成功, 路径为', chalk.cyan(paths.configPath))
    log.success('如果你忘记了路径，可以再次使用', chalk.cyan('hlink -g'), '查看配置文件路径')
    console.log()
  } catch (e) {
    log.error('配置文件创建失败')
    console.log()
  }
}

module.exports = createConfig
