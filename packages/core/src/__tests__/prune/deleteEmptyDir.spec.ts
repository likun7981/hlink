import { describe, test, beforeEach, expect } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import { getMockDir } from '../_utils'
import deleteEmptyDir from '../../prune/deleteEmptyDir'
import { checkPathExist } from '../../utils'

const { mockDir } = getMockDir(import.meta.url, 'empty_mock')

const dir1 = path.join(mockDir, '/b/c/d')
const dir2 = path.join(mockDir, '/b/e/d')
const file1 = path.join(mockDir, '/b/e/f1')

describe('deleteEmptyDir test', () => {
  beforeEach(async () => {
    await Promise.all([fs.ensureDir(dir1), fs.ensureDir(dir2)])
  })
  test('should be passed for single empty dir', async () => {
    await deleteEmptyDir(mockDir)
    expect(await checkPathExist(dir1)).toBeFalsy()
    expect(await checkPathExist(mockDir)).toBeFalsy()
  })
  test('should be passed for multiple empty dir', async () => {
    await deleteEmptyDir([dir1, dir2])
    expect(await checkPathExist(dir1)).toBeFalsy()
    expect(await checkPathExist(dir2)).toBeFalsy()
    expect(await checkPathExist(mockDir)).toBeTruthy()
    await deleteEmptyDir(mockDir)
  })
  test('should not rm unless empty dir', async () => {
    await fs.writeJSON(file1, {})
    await deleteEmptyDir(mockDir)
    expect(await checkPathExist(dir1)).toBeFalsy()
    expect(await checkPathExist(dir2)).toBeFalsy()
    expect(await checkPathExist(mockDir)).toBeTruthy()
    expect(await checkPathExist(path.dirname(file1))).toBeTruthy()
    await fs.rm(file1)
    await deleteEmptyDir(mockDir)
  })
})
