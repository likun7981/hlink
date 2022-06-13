import {
  getDirBasePath,
  getOriginalDestPath,
  findParent,
  makeOnly,
  warning,
  log,
  LogLevel,
  createTimeLog,
  checkPathExist,
} from '../../utils'
import { mockGlobalVar, consoleParams } from '../_utils'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import chalk from 'chalk'
import fs from 'fs-extra'

vi.mock('fs-extra', () => ({
  default: {
    stat: vi.fn(),
  },
}))

describe('utils test', () => {
  test('`getDirBasePath` should be passed', () => {
    expect(getDirBasePath('/a/b', '/a/b/c/d')).toEqual('b/c/d')
  })
  describe('`getOriginalDestPath` should be passed', () => {
    test('with saveMode=0', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/dir1/dir2/a',
          '/path/to/source',
          '/path/to/dest',
          0,
          true
        )
      ).eq('/path/to/dest/dir1/dir2')
    })
    test('with saveMode=1', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/dir1/dir2/a',
          '/path/to/source',
          '/path/to/dest',
          1,
          true
        )
      ).eq('/path/to/dest/dir2')
    })
    test('with saveMode=1 and mkdirIfSingle=false', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/a',
          '/path/to/source',
          '/path/to/dest',
          1,
          false
        )
      ).toMatchInlineSnapshot('"/path/to/dest"')
    })
    test('with saveMode=1 and mkdirIfSingle=true', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/a',
          '/path/to/source',
          '/path/to/dest',
          1,
          true
        )
      ).toMatchInlineSnapshot('"/path/to/dest/a"')
    })
  })

  test('`findParent` should be passed', () => {
    expect(findParent(['/a/b/c/d', '/a/b/e/f/g'])).toEqual('/a/b/')
    expect(findParent(['/a/e/c/d', '/a/b/e/f/g'])).toEqual('/a/')
  })

  test('`makeOnly` should be passed', () => {
    expect(makeOnly<string>(['/a/b/c', '/a/d', '/a/b/c'])).toStrictEqual([
      '/a/b/c',
      '/a/d',
    ])
  })

  test('`warning` should be passed', () => {
    const mock = mockGlobalVar([process, 'exit'], [console, 'log'])
    warning(true, 'showMethod')
    expect(console.log).toHaveBeenCalledTimes(2)
    expect(process.exit).toBeCalledWith(0)
    mock.reset()
    warning(false, 'not called')
    expect(console.log).not.toHaveBeenCalled()
    expect(process.exit).not.toHaveBeenCalled()
    mock.clear()
  })

  describe('`log`', () => {
    beforeEach(() => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => 0)
      return () => {
        spy.mockRestore()
      }
    })
    const levelsMap: Record<LogLevel, keyof typeof log> = {
      INFO: 'info',
      ERROR: 'error',
      SUCCEED: 'success',
      WARN: 'warn',
    }
    const levels = Object.keys(levelsMap) as LogLevel[]
    levels.forEach((level, index) => {
      test(`${level} method should be called right`, () => {
        const key = levelsMap[level]
        const calledParams = Array(index).fill(level)
        log[key](...calledParams)
        expect(console.log).toHaveBeenCalledWith(
          ...consoleParams[level](...calledParams)
        )
      })
    })
  })

  test('`createTimeLog` should be passed', () => {
    const spy = vi.spyOn(Date, 'now').mockImplementation(() => 1000)
    const spyLog = vi.spyOn(log, 'info').mockImplementation(() => 1000)
    const time = createTimeLog()
    spy.mockImplementationOnce(() => 2000)
    time.end()
    expect(log.info).toHaveBeenCalledWith('共计耗时', chalk.cyan(1), '秒')
    time.start()
    spy.mockImplementationOnce(() => 3000)
    time.end()
    expect(log.info).toHaveBeenCalledWith('共计耗时', chalk.cyan(2), '秒')
    spy.mockRestore()
    spyLog.mockRestore()
  })

  describe('`checkPathExist` ', async () => {
    beforeEach(() => {
      // @ts-ignore
      const spyProcess = vi.spyOn(process, 'exit').mockImplementation(() => {})
      // ignore console.log
      console.log = vi.fn()
      return () => {
        spyProcess.mockRestore()
        vi.resetAllMocks()
      }
    })
    test('should return true when exist', async () => {
      const checkResult = await checkPathExist('abc')
      expect(fs.stat).toHaveBeenCalledWith('abc')
      expect(checkResult).toEqual(true)
    })

    test('should exit and return undefined when not ignore error', async () => {
      // @ts-ignore
      fs.stat.mockRejectedValue(new Error('Async error'))
      const checkResult = await checkPathExist('abc', false)
      expect(process.exit).toHaveBeenCalledWith(0)
      expect(checkResult).toBeFalsy()
    })
    test('should return false when ignore error', async () => {
      // @ts-ignore
      fs.stat.mockRejectedValue(new Error('Async error'))
      const checkResult = await checkPathExist('abc')
      expect(process.exit).not.toBeCalled()
      expect(checkResult).toBeFalsy()
    })
  })
})