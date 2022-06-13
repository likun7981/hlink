import { describe, test } from 'vitest'
import getRmFiles from '../../prune/getRmFiles'
import { cacheRecord } from '../../utils/cacheHelp'
import { getMockDir } from '../_utils'

const { mockDir, mockJoin, originalJoin } = getMockDir(import.meta.url)

const source1 = originalJoin(mockDir, 'sourceDir1')
const source2 = originalJoin(mockDir, 'sourceDir2')
const dest1 = originalJoin(mockDir, 'destDir1')

const baseOptions = {
  sourceArr: [source1, source2],
  destArr: [dest1],
  include: [],
  exclude: [],
}

describe('getRmFiles test', () => {
  beforeAll(() => {
    return mockJoin()
  })
  test.only('should be passed baseConfig', () => {
    expect(getRmFiles(baseOptions)).toMatchInlineSnapshot(`
      [
        "destDir1/d1.mkv",
        "destDir1/d2.mp4",
        "destDir1/dir1/b.iso",
      ]
    `)
  })
  test.only('should not filter cache without reverse', () => {
    const spyCacheRed = vi
      .spyOn(cacheRecord, 'read')
      .mockImplementationOnce(() => {
        return ['destDir1/d1.mkv']
      })
    expect(getRmFiles(baseOptions)).toMatchInlineSnapshot(`
      [
        "destDir1/d1.mkv",
        "destDir1/d2.mp4",
        "destDir1/dir1/b.iso",
      ]
    `)
    spyCacheRed.mockRestore()
  })
  test.only('should be passed with reverse', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        reverse: true,
        sourceArr: [source2],
        destArr: [dest1],
      })
    ).toMatchInlineSnapshot(`
      [
        "sourceDir2/s2a.mkv",
        "sourceDir2/s2b.mp4",
        "sourceDir2/dir/s2c.m3",
      ]
    `)
  })
  test.only('should filter cache with reverse', () => {
    const spyCacheRed = vi
      .spyOn(cacheRecord, 'read')
      .mockImplementationOnce(() => {
        return ['sourceDir2/s2a.mkv', 'sourceDir2/s2b.mp4']
      })
    expect(
      getRmFiles({
        ...baseOptions,
        reverse: true,
        sourceArr: [source2],
        destArr: [dest1],
      })
    ).toMatchInlineSnapshot(`
      [
        "sourceDir2/dir/s2c.m3",
      ]
    `)
    spyCacheRed.mockRestore()
  })
  test.only('should be passed with rmDir', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        rmDir: true,
      })
    ).toMatchInlineSnapshot(`
      [
        "destDir1/",
      ]
    `)
  })
  test.only('should be passed with include', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        include: ['**.mkv'],
      })
    ).toMatchInlineSnapshot(`
      [
        "destDir1/d1.mkv",
      ]
    `)
  })
  test.only('should be passed with exclude', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        exclude: ['**.mkv'],
      })
    ).toMatchInlineSnapshot(`
      [
        "destDir1/d2.mp4",
        "destDir1/dir1/b.iso",
      ]
    `)
  })
  test.only('should be passed with exclude and include', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        exclude: ['**.mkv'],
        include: ['**.mkv', '**.mp4'],
      })
    ).toMatchInlineSnapshot(`
      [
        "destDir1/d2.mp4",
      ]
    `)
  })
})
