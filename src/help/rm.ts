import chalk from "chalk";

export default `QQ反馈群号：${chalk.cyanBright('807101297')}

说明:
  删除只对源文件或者源目录才会自动删除通过hlink关联的的硬链

用法:
  $ hlink rm /path/to/rm
  ${chalk.gray('自动监听创建记录')}
  $ hlink rm -w

可配置选项:
  --watch,-w        监听模式
`
