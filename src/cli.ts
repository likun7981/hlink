#!/usr/bin/env node
'use strict'

import meow from 'meow'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import hardLink from './index'
import createConfig from './config'
import * as paths from './config/paths'
import { log } from './utils'
import execa from 'execa'
import os from 'os'

const cli = meow(
  `
  QQ反馈群号：${chalk.cyanBright('807101297')}

  用法:
    $ hlink [--Options] [sourceDir] distDir

  可配置选项:
    --saveMode,-s         保存模式,默认为模式0
      ${chalk.gray(`saveMode=1 保存一级目录
      saveMode=0 保存原有的相对源地址的路径`)}

    --includeExtname,-i   包含的扩展名,多个用','隔开
      ${chalk.gray(`如果不配置该项,会采用以下策略
      *  1. 配置了excludeExtnam,则链接文件为排除后的其他文件
      *  2. 未配置excludeExtname,则链接文件为目录下的所有文件`)}

    --excludeExtname,-e   排除的扩展名,多个用','隔开如果配置了${chalk.cyan(
      'includeExtname'
    )}则该配置无效

    --maxFindLevel,-m     查找文件的最大层级,默认4层
    --delete,-d           删除目标地址所有硬链,默认为false
    --generateConfig,-g   生成config文件,可以使用 hlink -g 查看路径
    --removeConfig,-r     删除配置文件
    --configPath,-c       指定配置文件路径,请使用绝对路径
    --openCache,-o        是否打开缓存,默认为true, 会打开
      打开后,每次硬链后会把对应文件存入缓存,就算下次删除硬链，也不会进行硬链

    --mkdirIfSingle       是否为独立文件创建同名文件夹,默认为true,会创建
    --backup              备份hlink目录缓存等 备份路径
    --restore             还原hlink目录缓存等 还原路径

  例子:
    ${chalk.grey('# 创建 /share/download 下面文件到目标地址 /share/movie')}
    $ hlink /share/download /share/movie

    ${chalk.grey(
      '# 删除 /share/download 下面文件在 /share/movie 下面的对应硬链的文件夹'
    )}
    $ hlink -d /share/download /share/movie

    ${chalk.grey('# 交互删除(推荐)')}
    $ hlink -d

    ${chalk.grey('# 生成配置文件')}
    $ hlink -g`,
  {
    flags: {
      saveMode: {
        type: 'string',
        alias: 's'
      },
      includeExtname: {
        type: 'string',
        default: '',
        alias: 'i'
      },
      excludeExtname: {
        type: 'string',
        default: '',
        alias: 'e'
      },
      maxFindLevel: {
        type: 'string',
        alias: 'm'
      },
      delete: {
        type: 'boolean',
        alias: 'd'
      },
      generateConfig: {
        type: 'string',
        alias: 'g'
      },
      removeConfig: {
        type: 'boolean',
        alias: 'r'
      },
      configPath: {
        type: 'string',
        alias: 'c'
      },
      openCache: {
        type: 'boolean',
        alias: 'o',
        default: undefined
      },
      mkdirIfSingle: {
        type: 'boolean',
        default: undefined
      },
      backup: {
        type: 'string',
        default: undefined
      },
      restore: {
        type: 'string',
        default: undefined
      }
    }
  }
)
const flags = cli.flags

if (flags.backup) {
  execa.sync('cp', ['-r', paths.hlinkHomeDir, flags.backup])
} else if (flags.restore) {
  execa.sync('cp', [
    '-r',
    flags.restore.indexOf('.hlink')
      ? flags.restore
      : path.join(flags.restore, '.hlink'),
    os.homedir()
  ])
} else {
  if (flags.r) {
    if (fs.existsSync(flags.c || paths.configPath)) {
      fs.unlinkSync(flags.c || paths.configPath)
      log.success('移除配置文件成功')
      console.log()
    } else {
      log.warn('您并没有创建配置文件')
      console.log()
    }
  } else if ('g' in flags) {
    createConfig(
      !!flags.g
        ? path.isAbsolute(flags.g)
          ? path.join(flags.g, paths.configName)
          : path.join(process.cwd(), flags.g, paths.configName)
        : undefined
    )
  } else {
    hardLink(cli.input, flags)
  }
}

process.on('SIGINT', function() {
  log.info('手动中断')

  process.exit()
})
