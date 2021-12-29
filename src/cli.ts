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
import rm from './rm'
import watchRm from './watchRm'
import hlinkHelp from './help/hlink'
import rmHelp from './help/rm'

const cli = meow({
  autoHelp: false,
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
    },
    watch: {
      type: 'boolean',
      default: false,
      alias: 'w'
    }
  }
})
const flags = cli.flags
const [_command, _path] = cli.input

switch (_command) {
  case 'backup':
    if (!_path) {
      log.warn('请输入需要备份的路径', chalk.cyan('hlink backup 路径'))
      break
    }
    execa.sync('cp', ['-r', paths.hlinkHomeDir, flags.backup])
    break
  case 'restore':
    if (!_path) {
      log.warn('请输入需要还原的文件路径', chalk.cyan('hlink restore 路径'))
      break
    }
    execa.sync('cp', [
      '-r',
      flags.restore.indexOf('.hlink')
        ? flags.restore
        : path.join(flags.restore, '.hlink'),
      os.homedir()
    ])
    break
  case 'remove':
  case 'rm':
    if (flags.help) {
      console.log(rmHelp)
      break
    }
    if (flags.watch) {
      watchRm(_path)
    } else {
      rm(_path)
    }
    break
  default:
    if (flags.help) {
      console.log(hlinkHelp)
    } else if (flags.r) {
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
  log.info('由于你手动中断, 已硬链的文件不会进行缓存')
  process.exit()
})
