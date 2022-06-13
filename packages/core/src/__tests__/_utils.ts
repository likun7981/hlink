import { vi } from 'vitest'
import { getTag, LogLevel } from '../utils'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type MockType<T extends Record<string, any>> = [
  variable: T,
  attr: keyof T,
  implementation?: (...args: any) => any
]

export function mockGlobalVar(...args: MockType<any>[]) {
  const originalMethods = args.map((mock) => {
    const [obj, method] = mock
    const originalMethod = obj[method]
    obj[method] = vi.fn(() => 0)
    return originalMethod
  })
  return {
    clear: () => {
      originalMethods.forEach((original, index) => {
        const [obj, method] = args[index]
        obj[method] = original
      })
    },
    reset: () => {
      args.forEach((instance) => {
        const [obj, method] = instance
        obj[method].mockReset()
      })
    },
  }
}

export const consoleParams: Record<LogLevel, (...arg: any) => any[]> = {
  INFO: (...args: any) => [getTag('INFO'), ...args],
  WARN: (...args: any) => [getTag('WARN'), ...args],
  ERROR: (...args: any) => [getTag('ERROR'), ...args],
  SUCCEED: (...args: any) => [getTag('SUCCEED'), ...args],
}

export const wait = async (timer: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(1), timer)
  })
}

export const getMockDir = (cwdUrl: string, name = 'mock_dir') => {
  const mockDir = path.join(path.dirname(fileURLToPath(cwdUrl)), name)
  const originalJoin = path.join
  return {
    mockDir,
    originalJoin,
    mockJoin: () => {
      const spy = vi.spyOn(path, 'join').mockImplementation((a, b) => {
        // mock relative path
        return originalJoin(
          path.isAbsolute(a) ? path.relative(mockDir, a) : a,
          b
        )
      })
      return () => {
        spy.mockRestore()
      }
    },
  }
}

export const mockJoin = () => {}