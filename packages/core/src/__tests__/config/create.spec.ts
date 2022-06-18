import { describe, test, expect, vi, beforeEach, beforeAll } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import create from '../../config/create'
import { getMockDir } from '../_utils'
import { checkPathExist } from '../../utils'

const { mockDir } = getMockDir(import.meta.url, 'mock_dir')

const configPath = path.join(mockDir, 'hlink.config.mjs')

describe('create test', () => {
  beforeAll(() => {
    // vi.spyOn(console, 'log').mockImplementation(() => 0)
    return () => {
      vi.restoreAllMocks()
    }
  })
  beforeEach(async () => {
    await fs.ensureDir(mockDir)
    return async () => {
      await fs.rm(mockDir, {
        recursive: true,
      })
    }
  })
  test('should create succeed', async () => {
    await create(mockDir)
    expect(await checkPathExist(configPath)).toEqual(true)
  })
})
