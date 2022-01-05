import chalk from 'chalk'

export default `
QQ反馈群号：${chalk.cyanBright('807101297')}

提醒:
  ${chalk.cyan('谨慎使用该命令，移除后无法恢复')}

说明:
  删除通过hlink创建的硬链或者源文件

用法:
  ${chalk.gray('手动移除')}
  $ hlink rm /path/to/fileOrDir
  ${chalk.gray('自动监听文件或者文件夹')}
  $ hlink rm -w /path/to/fileOrDir
  ${chalk.gray('自动监听并且同时会移除源文件')}
  $ hlink rm -wa /path/to/fileOrDir

可配置选项:
  --watch,-w        监听模式
                    ${chalk.gray(`监听的文件夹发生移除时，会自动找到使用hlink关联的硬链及源文件，
                    具体删除行为以 --all 配置为准
                    一般用于监听目标文件夹，当然你也可以监听源文件夹`)}

  --all,-a          是否删除所有关联的文件
                    ${chalk.gray(`1.该选择为true，则会删除源文件及硬链文件
                    2.该选项为false，则只会移除硬链文件`)}
                    ${chalk.yellow(`重要说明:`)}
                    ${chalk.gray(`1.在不指定该选项值时: 监听模式默认为false,非监听模式默认为true
                    2.通过系统自带命令或者三方软件移除的源文件，则源文件同样会被删除`)}
`
