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
  test('should exit when not pathsMapping', async () => {
    const exitSpyOn = vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    await formatConfig({ pathsMapping: {} })
    expect(exitSpyOn).toHaveBeenCalled()
  })
  test('should exit when relative path', async () => {
    const exitSpyOn = vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    await formatConfig({ pathsMapping: { './a': '/b' } })
    expect(exitSpyOn).toHaveBeenCalled()
  })
  test('should exit when path not exist', async () => {
    const exitSpyOn = vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    await formatConfig({ pathsMapping: { '/a': '/b' } })
    expect(exitSpyOn).toHaveBeenCalled()
  })
  test('should exit when same source and dest', async () => {
    const exitSpyOn = vi.spyOn(process, 'exit').mockImplementation(vi.fn())
    await formatConfig({ pathsMapping: { '/b': '/b' } })
    expect(exitSpyOn).toHaveBeenCalled()
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
          "*.mp4",
          "*.flv",
          "*.f4v",
          "*.webm",
          "*.m4v",
          "*.mov",
          "*.cpk",
          "*.dirac",
          "*.3gp",
          "*.3g2",
          "*.rm",
          "*.rmvb",
          "*.wmv",
          "*.avi",
          "*.asf",
          "*.mpg",
          "*.mpeg",
          "*.mpe",
          "*.vob",
          "*.mkv",
          "*.ram",
          "*.qt",
          "*.fli",
          "*.flc",
          "*.mod",
          "*.iso",
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
          "*.mp4",
          "*.flv",
          "*.f4v",
          "*.webm",
          "*.m4v",
          "*.mov",
          "*.cpk",
          "*.dirac",
          "*.3gp",
          "*.3g2",
          "*.rm",
          "*.rmvb",
          "*.wmv",
          "*.avi",
          "*.asf",
          "*.mpg",
          "*.mpeg",
          "*.mpe",
          "*.vob",
          "*.mkv",
          "*.ram",
          "*.qt",
          "*.fli",
          "*.flc",
          "*.mod",
          "*.iso",
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
          "*.mkv",
        ],
        "pathsMapping": {
          "/a": "/b",
        },
      }
    `)
  })
})
