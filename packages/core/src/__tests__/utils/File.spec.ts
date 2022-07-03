import { vi, describe, test, beforeEach, expect, afterAll } from 'vitest'
import fs from 'fs-extra'
import File from '../../utils/File'
import { wait } from '../_utils'

vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(),
    ensureDirSync: vi.fn(),
    writeJSONSync: vi.fn(() => {}),
    readJSONSync: vi.fn(),
    ensureDir: vi.fn(),
  },
}))

describe('File test', () => {
  let config: File<any>
  afterAll(() => {
    vi.restoreAllMocks()
  })
  beforeEach(() => {
    config = new File('a', {}, '/save/dir')
    return () => {
      // @ts-ignore
      fs.writeJSONSync.mockReset()
      // @ts-ignore
      fs.readJSONSync.mockReset()
    }
  })
  test('instance private attr should right attribute', () => {
    // @ts-ignore
    expect(config.jsonPath).toEqual('/save/dir/a')
    // @ts-ignore
    expect(config.backupPath).toEqual('/save/dir/a_backup')
  })
  describe('multiple read', () => {
    test('should called once original fs read method when file exists', async () => {
      vi.spyOn(fs, 'existsSync').mockImplementation(() => true)
      const spyRead = vi
        .spyOn(fs, 'readJSONSync')
        .mockImplementation(() => ({ a: 1 }))
      config.read()
      config.read()
      config.read()
      expect(fs.readJSONSync).toHaveBeenCalledOnce()
      await wait(21)
      expect(fs.writeJSONSync).not.toBeCalled()
      spyRead.mockReset()
    })
    test('should called once original fs read method when file not exists', async () => {
      vi.spyOn(fs, 'existsSync').mockImplementation(() => false)
      config.read()
      config.read()
      config.read()
      expect(fs.readJSONSync).not.toBeCalled()
      await wait(21)
      expect(fs.writeJSONSync).toHaveBeenCalledOnce()
    })
  })
  test('multiple write should to called once original fs write', async () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(() => true)
    config.write({})
    config.write({})
    config.write({})
    await wait(21)
    expect(fs.writeJSONSync).toHaveBeenCalledOnce()
  })
})
