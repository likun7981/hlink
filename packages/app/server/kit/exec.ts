import { IOptions, IPruneOptions } from '@hlink/core'
import { execa } from 'execa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type OptionsType = {
  main: IOptions
  prune: IPruneOptions
}

export type ReturnType<T extends 'main' | 'prune'> = {
  command: T
  config: OptionsType[T]
}

function start<T extends 'main' | 'prune'>(
  command: T,
  options: OptionsType[T],
  log?: (data: string, type: 'succeed' | 'failed') => void
) {
  const monitor = execa('node', [
    path.join(__dirname, './nodeExec.js'),
    command,
    JSON.stringify(options),
  ])
  if (log) {
    monitor.stdout?.on('data', (e) => {
      const str = e.toString()
      if (str) {
        log(str.split('\n').filter(Boolean).join('\n'), 'succeed')
      }
    })
    monitor.stderr?.on('data', (e) => {
      const str = e.toString()
      log(str, 'failed')
    })
  }
  return {
    kill: () => monitor.kill('SIGILL'),
    handleLog: (log: (data: string, type: 'succeed' | 'failed') => void) => {
      monitor.stdout?.on('data', (e) => {
        const str = e.toString()
        if (str) {
          log(str.split('\n').filter(Boolean).join('\n'), 'succeed')
        }
      })
      monitor.stderr?.on('data', (e) => {
        const str = e.toString()
        log(str, 'failed')
      })
    },
    original: monitor,
  }
}

export default start
