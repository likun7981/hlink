#!/usr/bin/env node
import chalk from 'chalk'
import meow from 'meow'
import rm from './bins/rm/index.js'
import { restore, backup } from './bins/qnap.js'
import hlink from './bins/main/index.js'
import { log } from './utils.js'

const cli = meow({
  autoHelp: false,
  booleanDefault: undefined,
  importMeta: import.meta,
  flags: {
    saveMode: {
      type: 'number',
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
    openCache: {
      type: 'boolean',
      alias: 'o'
    },
    mkdirIfSingle: {
      type: 'boolean',
      alias: 'm'
    },
    del: {
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
    watch: {
      type: 'boolean',
      alias: 'w'
    },
    all: {
      type: 'boolean',
      alias: 'a',
      default: false
    }
  }
})
const { help, watch, all, del, ...flags } = cli.flags as IHlink.Flags
const [_command, ...inputs] = cli.input

if (del) {
  log.warn(
    `已移除 ${chalk.gray('-d')} 配置选项，请使用 ${chalk.cyan(
      'hlink rm'
    )} 替代,详情见 ${chalk.cyan('hlink rm --help')}`
  )
  process.exit(0)
}

switch (_command) {
  case 'backup':
    backup(inputs[0])
    break
  case 'restore':
    restore(inputs[0])
    break
  case 'remove':
  case 'rm':
    rm(inputs, {
      watch,
      help,
      all,
    })
    break
  default:
    hlink(cli.input, {
      ...flags,
      help
    })
}

process.on('SIGINT', () => {
  if (global.printOnExit) {
    console.log()
    global.printOnExit()
  }
  process.exit(0)
})
