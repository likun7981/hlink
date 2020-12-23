#!/usr/bin/env node
'use strict'
const chalk = require('chalk')
const meow = require('meow')
const fs = require('fs-extra')
const hardLink = require('./lib/index')
const createConfig = require('./lib/createConfig')
const configPaths = require('./lib/configPaths')
const log = require('./lib/log')

const cli = meow(
  `
  QQ反馈群号：${chalk.cyanBright('807101297')}

  用法:
    $ hlink [--Options] [sourceDir] distDir

  可配置选项:
    --saveMode,-s         保存模式,默认为模式0
      ${chalk.gray(`saveMode=1 保存一级目录
      saveMode=0 保存原有的相对源地址的路径`)}

    --includeExtname,-e   包含的扩展名,多个用','隔开
      ${chalk.gray(`如果不配置该项，会采用以下策略
      *  1. 配置了excludeExtname，则链接文件为排除后的其他文件
      *  2. 未配置excludeExtname，则链接文件为目录下的所有文件`)}

    --excludeExtname,-c   排除的扩展名,多个用','隔开如果配置了${chalk.cyan('includeExtname')}则该配置无效

    --maxFindLevel,-m     查找文件的最大层级, 默认4层
    --delete,-d           删除目标地址所有硬链，默认为false
    --generateConfig,-g   生成config文件，可以使用 hlink --c 查看具体路径
    --removeConfig,-r     删除配置文件
    --useConfig,-u        使用config文件配置，会忽略命令行带入的配置项

  例子:
    ${chalk.grey('# 创建 /share/download 下面文件到目标地址 /share/movie')}
    $ hlink /share/download /share/movie

    ${chalk.grey('# 删除 /share/download 下面文件在 /share/movie 下面的对应硬链的文件夹')}
    $ hlink -d /share/download /share/movie

    ${chalk.grey('# 交互删除(推荐)')}
    $ hlink -d

    ${chalk.grey('# 生成配置文件')}
    $ hlink -g`,
  {
    flags: {
      saveMode: {
        type: 'string',
        default: '0',
        alias: 's'
      },
      includeExtname: {
        type: 'string',
        default: '',
        alias: 'e'
      },
      excludeExtname: {
        type: 'string',
        default: '',
        alias: 'c'
      },
      maxFindLevel: {
        type: 'string',
        default: '4',
        alias: 'm'
      },

      delete: {
        type: 'boolean',
        alias: 'd'
      },
      generateConfig: {
        type: 'boolean',
        alias: 'g'
      },
      removeConfig: {
        type: 'boolean',
        alias: 'r'
      },
      useConfig: {
        type: 'string',
        alias: 'u'
      }
    }
  }
)
const flags = cli.flags

if (flags.r || flags.removeConfig) {
  if (fs.existsSync(configPaths.configPath)) {
    fs.unlinkSync(configPaths.configPath)
    log.success('移除配置文件成功')
    console.log()
  } else {
    log.warn('您并没有创建配置文件')
    console.log()
  }
} else if (flags.g || flags.generateConfig) {
  createConfig()
} else {
  hardLink(cli.input, flags)
}
