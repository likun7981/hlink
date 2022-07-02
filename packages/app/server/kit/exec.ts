import { IOptions, IPruneOptions } from '@hlink/core'
import { execa } from 'execa'
import path from 'node:path'
import __dirname from './__dirname.js'

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
  options: OptionsType[T] & { usedBy?: string },
  log?: (data: string, type: 'succeed' | 'failed') => void
) {
  const execPath = path.join(__dirname(import.meta.url), './nodeExec.js')
  const monitor = execa(
    process.execPath,
    [execPath, command, JSON.stringify(options)],
    {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        USED_BY_APP: options.usedBy || 'browser',
      },
    }
  )
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
