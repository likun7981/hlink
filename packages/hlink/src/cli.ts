#!/usr/bin/env node

// eslint-disable-next-line node/shebang
import chalk from 'chalk'
import meow from 'meow'
import fs from 'fs-extra'
import { restore, backup } from './bins/qnap.js'
import doctor from './bins/doctor.js'
import prune from './bins/prune/index.js'
import hlink from './bins/main/index.js'
import { log } from './utils.js'
import updateNotifier from 'update-notifier'
import path from 'path'
import { fileURLToPath } from 'url'

const pkg = fs.readJSONSync(
  path.resolve(fileURLToPath(import.meta.url), '../../package.json')
)

const notifier = updateNotifier({
  pkg,
})

notifier.notify({
  isGlobal: true,
  message:
    '有版本可更新 ' +
    chalk.dim('{currentVersion}') +
    chalk.reset(' → ') +
    chalk.green('{latestVersion}') +
    ' \n使用命令 ' +
    chalk.cyan('{updateCommand}') +
    ' 进行更新，更新日志：' +
    '\nhttps://github.com/likun7981/hlink/releases',
})

const cli = meow({
  autoHelp: false,
  booleanDefault: undefined,
  importMeta: import.meta,
  flags: {
    saveMode: {
      type: 'number',
      alias: 's',
    },
    includeExtname: {
      type: 'string',
      default: '',
      alias: 'i',
    },
    excludeExtname: {
      type: 'string',
      default: '',
      alias: 'e',
    },
    openCache: {
      type: 'boolean',
      alias: 'o',
    },
    mkdirIfSingle: {
      type: 'boolean',
      alias: 'm',
    },
    del: {
      type: 'boolean',
      alias: 'd',
    },
    generateConfig: {
      type: 'string',
      alias: 'g',
    },
    removeConfig: {
      type: 'boolean',
      alias: 'r',
    },
    configPath: {
      type: 'string',
      alias: 'c',
    },

    pruneDir: {
      type: 'boolean',
      alias: 'p',
    },
    withoutConfirm: {
      type: 'boolean',
      alias: 'w',
      default: false,
    },
    reverse: {
      type: 'boolean',
      alias: 'r',
      default: false,
    },
  },
})
const { help, del, ...flags } = cli.flags as IHlink.Flags
const [_command, ...inputs] = cli.input

function logDeprecatedRm() {
  log.info(`${chalk.gray('rm')} 命令彻底废除，使用体感特别差，没有存在的意义`)
  log.info(
    `如果你只是简单想删除硬链，请使用系统自带的 rm 命令，用法可以参考${chalk.cyan(
      'https://www.linuxcool.com/rm'
    )}`
  )
  log.info(
    `如果你只是在移除源文件后，检测多余的硬链，可以使用 ${chalk.cyan(
      'hlink prune'
    )} 来进行`
  )
}

/**
 * @deprecated
 */
if (del) {
  logDeprecatedRm
  process.exit(0)
}

switch (_command) {
  case 'backup':
    backup(inputs[0])
    break
  case 'restore':
    restore(inputs[0])
    break
  case 'doctor':
    doctor()
    break
  case 'remove':
  case 'rm':
    logDeprecatedRm()
    break
  case 'prune':
    prune(inputs[0], inputs[1], {
      help,
      ...flags,
    })
    break
  default:
    hlink(cli.input, {
      ...flags,
      help,
    })
}

process.on('SIGINT', () => {
  if (global.printOnExit) {
    console.log()
    global.printOnExit()
  }
  process.exit(0)
})
