#!/usr/bin/env node

import meow from 'meow'
import bins from './bins/index.js'

const { hlink, rm, backup, restore } = bins

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
    scan: {
      type: 'boolean',
    },
    all: {
      type: 'boolean',
      alias: 'a'
    }
  }
})
const { help, scan, all, ...flags } = cli.flags as IHlink.Flags
const [_command, ...inputs] = cli.input

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
      scan,
      help,
      all
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
