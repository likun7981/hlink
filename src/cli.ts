#!/usr/bin/env node
import chalk from 'chalk'
import meow from 'meow'
import { restore, backup } from './bins/qnap.js'
import doctor from './bins/doctor.js'
import prune from './bins/prune/index.js'
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
      default: 'mp4,flv,f4v,webm,m4v,mov,cpk,dirac,3gp,3g2,rm,rmvb,wmv,avi,asf,mpg,mpeg,mpe,vob,mkv,ram,qt,fli,flc,mod,iso',
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
    pruneDir: {
      type: 'boolean',
      alias: 'p'
    },
    withoutConfirm: {
      type: 'boolean',
      alias: 'w',
      default: false,
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
    }
  }
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
      pruneDir: flags.pruneDir,
      withoutConfirm: flags.withoutConfirm
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
