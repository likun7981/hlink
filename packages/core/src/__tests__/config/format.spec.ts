import { describe, test, expect, vi, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'fs-extra'
import formatConfig from '../../config/format'
import { getMockDir } from '../_utils'
import * as utils from '../../utils/index.js'

const { mockDir } = getMockDir(import.meta.url, 'mock_dir')

const sourceDir = path.join(mockDir, 'source')
const destDir = path.join(mockDir, 'dest')

describe('format test', () => {
  beforeEach(async () => {
    await Promise.all([fs.ensureDir(sourceDir), fs.ensureDir(destDir)])
    console.log = vi.fn()
    return async () => {
      await fs.rm(mockDir, {
        recursive: true,
      })
      vi.restoreAllMocks()
    }
  })
  test('should exit when no one source and dest', async () => {
    expect(formatConfig({ pathsMapping: { '/b': '/b' } })).rejects.toThrowError(
      '过滤后，没有一个路径满足要求'
    )
    expect(formatConfig({ pathsMapping: { '/a': '/b' } })).rejects.toThrowError(
      '过滤后，没有一个路径满足要求'
    )
    expect(
      formatConfig({ pathsMapping: { './a': '/b' } })
    ).rejects.toThrowError('过滤后，没有一个路径满足要求')
    expect(formatConfig({ pathsMapping: {} })).rejects.toThrowError(
      '至少配置一个路径'
    )
  })
  test('should get right result', async () => {
    vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    vi.spyOn(utils, 'checkPathExist').mockImplementation(async () => true)
    const result = await formatConfig({
      pathsMapping: { '/a': '/b' },
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "exclude": [],
        "include": [
          "**",
        ],
        "pathsMapping": {
          "/a": "/b",
        },
      }
    `)
  })
  test('should get right include and exclude', async () => {
    vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    vi.spyOn(utils, 'checkPathExist').mockImplementation(async () => true)
    const result = await formatConfig({
      pathsMapping: { '/a': '/b' },
      include: [],
      exclude: [],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "exclude": [],
        "include": [
          "**",
        ],
        "pathsMapping": {
          "/a": "/b",
        },
      }
    `)
  })
  test('should get right include and exclude', async () => {
    vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    vi.spyOn(utils, 'checkPathExist').mockImplementation(async () => true)
    const result = await formatConfig({
      pathsMapping: { '/a': '/b' },
      include: ['mkv'],
      exclude: [],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "exclude": [],
        "include": [
          "**/*.mkv",
        ],
        "pathsMapping": {
          "/a": "/b",
        },
      }
    `)
  })
})
