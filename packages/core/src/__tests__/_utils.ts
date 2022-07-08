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

export const strMapping = {
  d1: `
4445140 a.mkv
4445141 d1.mkv
4445142 d2.mp4
4445143 dir1/
4445145 dir2/

destDir1/dir1:
4445144 b.iso

destDir1/dir2:
4445146 c.mp4
  `,
  s1: `
4445140 a.mkv
4445149 dir2/

sourceDir1/dir2:
4445146 c.mp4
`,
  s2: `
4445152 dir/
4445154 s2a.mkv
   4445155 s2b.mp4

sourceDir2/dir:
4445153 s2c.m3
  `,
}

export const mockLs = (p: keyof typeof strMapping) =>
  strMapping[p] || strMapping.s2
