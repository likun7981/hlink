import { describe, test, expect, vi, beforeEach, beforeAll } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import create from '../../config/create'
import { getMockDir } from '../_utils'
import { checkPathExist } from '../../utils'

// 使用独立目录，避免与 format.spec.ts 并行运行时共享 mock_dir 产生竞态
const { mockDir } = getMockDir(import.meta.url, 'mock_create_dir')

const configPath = path.join(mockDir, 'hlink.config.mjs')

describe('create test', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => 0)
    return () => {
      vi.restoreAllMocks()
    }
  })
  test('should create succeed', async () => {
    await fs.ensureDir(mockDir)
    await create(mockDir)
    expect(await checkPathExist(configPath)).toEqual(true)
    await fs.rm(mockDir, {
      recursive: true,
    })
  })
})
