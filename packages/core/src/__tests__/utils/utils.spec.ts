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
  findParentRelative,
  chalk,
  logWrapper,
} from '../../utils'
import { mockGlobalVar } from '../_utils'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import fs from 'fs-extra'

describe('utils test', () => {
  test('`getDirBasePath` should be passed', () => {
    expect(getDirBasePath('/a/b', '/a/b/c/d')).toEqual('b/c/d')
  })
  describe('`getOriginalDestPath` should be passed', () => {
    test('with keepDirStruct=true', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/dir1/dir2/a',
          '/path/to/source',
          '/path/to/dest',
          true,
          true
        )
      ).toEqual('/path/to/dest/dir1/dir2')
    })
    test('with keepDirStruct=false', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/dir1/dir2/a',
          '/path/to/source',
          '/path/to/dest',
          false,
          true
        )
      ).toEqual('/path/to/dest/dir2')
    })
    test('with keepDirStruct=false and mkdirIfSingle=false', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/a',
          '/path/to/source',
          '/path/to/dest',
          false,
          false
        )
      ).toMatchInlineSnapshot('"/path/to/dest"')
    })
    test('with keepDirStruct=false and mkdirIfSingle=true', () => {
      expect(
        getOriginalDestPath(
          '/path/to/source/a',
          '/path/to/source',
          '/path/to/dest',
          false,
          true
        )
      ).toMatchInlineSnapshot('"/path/to/dest/a"')
    })
  })

  test('`findParent` should be passed', () => {
    expect(findParent(['/a/b/c/d', '/a/b/e/f/g'])).toEqual('/a/b/')
    expect(findParent(['/a/e/c/d', '/a/b/e/f/g'])).toEqual('/a/')
  })
  test('`findParentRelative` should be passed', () => {
    expect(findParentRelative(['/a/b/c/d', '/a/b/e/f/g']))
      .toMatchInlineSnapshot(`
      [
        "c/d",
        "e/f/g",
      ]
    `)
    expect(findParentRelative(['/a/e/c/d', '/a/b/e/f/g']))
      .toMatchInlineSnapshot(`
      [
        "e/c/d",
        "b/e/f/g",
      ]
    `)
  })

  test('`makeOnly` should be passed', () => {
    expect(makeOnly<string>(['/a/b/c', '/a/d', '/a/b/c'])).toStrictEqual([
      '/a/b/c',
      '/a/d',
    ])
  })

  test('`warning` should be passed', () => {
    const mock = mockGlobalVar([console, 'log'])
    warning(false, 'showMethod')
    expect(console.log).toHaveBeenCalledTimes(0)
    mock.reset()
    expect(() => warning(true, 'not called')).toThrowError('not called')
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
          logWrapper[key](...calledParams)
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
      process.exit = vi.fn()
      console.log = vi.fn()
      return () => {
        vi.restoreAllMocks()
      }
    })
    test('should return true when exist', async () => {
      const fsSpyOn = vi
        .spyOn(fs, 'stat')
        .mockImplementation(async (): Promise<any> => {})
      const checkResult = await checkPathExist('abc')
      expect(fsSpyOn).toHaveBeenCalledWith('abc')
      expect(checkResult).toEqual(true)
    })

    test('should exit and return undefined when not ignore error', async () => {
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error('Async error'))
      const checkResult = await checkPathExist('abc', false)
      expect(process.exit).toHaveBeenCalledWith(0)
      expect(checkResult).toBeFalsy()
    })
    test('should return false when ignore error', async () => {
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error('Async error'))
      const checkResult = await checkPathExist('abc')
      expect(process.exit).not.toBeCalled()
      expect(checkResult).toBeFalsy()
    })
  })
})
