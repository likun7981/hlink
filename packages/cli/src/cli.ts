#!/usr/bin/env node

// eslint-disable-next-line node/shebang
import meow from 'meow'
import { configPath, config, log, chalk } from '@hlink/core'
import path from 'node:path'
import { restore, backup } from './bins/qnap.js'
import doctor from './bins/doctor.js'
import prune from './bins/prune.js'
import hlink from './bins/hlink.js'
import updater from './updater.js'
import app from '@hlink/app'

updater()

const cli = meow({
  autoHelp: false,
  booleanDefault: undefined,
  importMeta: import.meta,
  flags: {
    openCache: {
      type: 'boolean',
      alias: 'o',
    },
    deleteDir: {
      type: 'boolean',
      alias: 'd',
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

const [_command, ...inputs] = cli.input

switch (_command) {
  case 'backup':
    backup(inputs[0])
    break
  case 'restore':
    restore(inputs[0])
    break
  case 'serve':
    if (inputs[0] === 'start') {
      app.start()
    } else if (inputs[0] === 'stop') {
      app.stop()
    } else {
      log.error('未知命令')
      log.info('服务启动命令', chalk.cyan('hlink serve start'))
      log.info('服务关闭命令', chalk.cyan('hlink serve stop'))
    }
    break
  case 'doctor':
    doctor()
    break
  case 'gen':
  case 'g':
    config.create(path.resolve(inputs[0] || configPath))
    break
  case 'prune':
    prune({
      configPath: inputs[0],
      ...cli.flags,
    })
    break
  default:
    hlink({
      configPath: _command,
      ...cli.flags,
    })
}

process.on('SIGINT', () => {
  process.exit(0)
})
