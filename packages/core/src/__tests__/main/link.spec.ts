import { describe, test, beforeEach, expect, vi, beforeAll } from 'vitest'
import path from 'node:path'
import fs from 'fs-extra'
import * as execa from 'execa'
import { getMockDir } from '../_utils'
import link from '../../main/link'
import { checkPathExist } from '../../utils'
import HLinkError, { ErrorCode } from '../../core/HlinkError'

const { mockDir } = getMockDir(import.meta.url, 'mock_dir')

const sourceDir = path.join(mockDir, 'source')
const destDir = path.join(mockDir, 'dest')
const sourceFile = path.join(sourceDir, 'data.json')
const destFile = path.join(destDir, 'data.json')

vi.mock('execa', async () => {
  const originalExeca = (await vi.importActual('execa')) as any
  return { ...originalExeca }
})

describe('link test', () => {
  beforeAll(() => {
    console.log = vi.fn()
    return () => {
      vi.restoreAllMocks()
    }
  })

  beforeEach(async () => {
    await Promise.all([fs.ensureDir(sourceDir), fs.ensureDir(destDir)])
    await fs.writeJSON(sourceFile, {})
    return async () => {
      await fs.rm(mockDir, {
        recursive: true,
      })
    }
  })

  test('should be passed', async () => {
    await link(sourceFile, destDir, sourceDir, destDir)
    expect(await checkPathExist(destFile)).toEqual(true)
  })

  test('should throw a hlink error when file exits', async () => {
    await fs.writeJSON(destFile, {})
    try {
      await link(sourceFile, destDir, sourceDir, destDir)
    } catch (e) {
      const error = e as HLinkError
      expect(error).instanceOf(HLinkError)
      expect(error.isHlinkError).toEqual(true)
      expect(error.ignore).toEqual(true)
      expect(error.code).toEqual(ErrorCode.FileExists)
    }
  })

  test('should throw a hlink error when cross link', async () => {
    vi.spyOn(execa, 'execa').mockImplementationOnce(() => {
      throw new Error('Invalid cross-device link')
    })
    try {
      await link(sourceFile, destDir, sourceDir, destDir)
    } catch (e) {
      const error = e as HLinkError
      expect(error).instanceOf(HLinkError)
      expect(error.isHlinkError).toEqual(true)
      expect(error.ignore).toEqual(false)
      expect(error.code).toEqual(ErrorCode.CrossDeviceLink)
    }
  })

  test('should throw a hlink error when not permmitted', async () => {
    vi.spyOn(execa, 'execa').mockImplementationOnce(() => {
      throw new Error('Operation not permitted')
    })
    try {
      await link(sourceFile, destDir, sourceDir, destDir)
    } catch (e) {
      const error = e as HLinkError
      expect(error).instanceOf(HLinkError)
      expect(error.isHlinkError).toEqual(true)
      expect(error.ignore).toEqual(false)
      expect(error.code).toEqual(ErrorCode.NotPermitted)
    }
  })
})
