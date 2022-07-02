#!/usr/bin/env node

// eslint-disable-next-line node/shebang
import meow from 'meow'
import { configPath, config } from '@hlink/core'
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
  case 'start':
    app.start()
    break
  case 'stop':
    app.stop()
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
