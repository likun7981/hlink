#!/usr/bin/env node
'use strict'
const chalk = require('chalk')
const meow = require('meow')
const hardLink = require('./lib/index')
const exts = require('./lib/exts')([])

const cli = meow(
  `
  用法:
    $ hlink [--Options] [sourceDir] distDir

  可配置选项:
    --saveMode,-s      保存模式,默认为模式0
      ${chalk.gray(`saveMode=1 保存一级目录
      saveMode=0 保存原有的相对源地址的路径`)}

    --ext,-e           额外需要做外链扩展名
      ${chalk.gray(`默认包含了常用了的视频扩展名: ${exts.join(',')}`)}

    --maxFindLevel,-m  查找文件的最大层级, 默认4层
    --delete,-d        删除目标地址所有硬链，默认为false

  例子:
    ${chalk.grey('# 创建 /share/download 下面文件到目标地址 /share/movie')}
    $ hlink /share/download /share/movie

    ${chalk.grey('# 删除 /share/download 下面文件在 /share/movie 下面的对应硬链的文件夹')}
    $ hlink -d /share/download /share/movie

  说明:
    1. 创建硬链时，会自动检测硬链接是否存在，硬链改名同样能检测到
    2. sourceDir 不填，则表示 sourceDir 为当前 运行目录
`,
  {
    flags: {
      saveMode: {
        type: 'string',
        default: '0',
        alias: 's'
      },
      ext: {
        type: 'string',
        default: '',
        alias: 'e'
      },
      maxFindLevel: {
        type: 'string',
        default: '4',
        alias: 'm'
      },
      delete: {
        type: 'boolean',
        alias: 'd'
      }
    }
  }
)

hardLink(cli.input, cli.flags)
