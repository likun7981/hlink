import { describe, test, expect, vi, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'fs-extra'
import formatConfig from '../../utils/formatConfig'
import { getMockDir } from '../_utils'

const { mockDir } = getMockDir(import.meta.url, 'mock_dir')

const sourceDir = path.join(mockDir, 'source')
const destDir = path.join(mockDir, 'dest')

describe('formatConfig test', () => {
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
    const result = await formatConfig({
      pathsMapping: { [sourceDir]: destDir },
    })
    expect(result).toStrictEqual({
      pathsMapping: {
        [sourceDir]: destDir,
      },
    })
  })
})
