import { describe, test, expect, vi } from 'vitest'
import getRmFiles from '../../prune/getRmFiles'
import { cacheRecord } from '../../utils/cacheHelp'

const source1 = 's1'
const source2 = 's2'
const dest1 = 'd1'

const baseOptions = {
  sourceArr: [source1, source2],
  destArr: [dest1],
  include: [],
  exclude: [],
}

import { strMapping } from '../_utils'

vi.mock('../../core/lsirfl.js', () => ({
  default: (p: keyof typeof strMapping) => strMapping[p] || strMapping.s1,
}))

describe('getRmFiles test', () => {
  test('should be passed baseConfig', () => {
    expect(getRmFiles(baseOptions)).toMatchInlineSnapshot(`
      [
        "d1/d1.mkv",
        "d1/d2.mp4",
        "d1/b.iso",
      ]
    `)
  })
  test('should not filter cache without reverse', () => {
    const spyCacheRed = vi
      .spyOn(cacheRecord, 'read')
      .mockImplementationOnce(() => {
        return ['d1/d1.mkv']
      })
    expect(getRmFiles(baseOptions)).toMatchInlineSnapshot(`
      [
        "d1/d1.mkv",
        "d1/d2.mp4",
        "d1/b.iso",
      ]
    `)
    spyCacheRed.mockRestore()
  })
  test('should be passed with reverse', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        reverse: true,
        sourceArr: [source2],
        destArr: [dest1],
      })
    ).toMatchInlineSnapshot(`
      [
        "s2/s2a.mkv",
        "s2/s2b.mp4",
        "s2/s2c.m3",
      ]
    `)
  })
  test('should filter cache with reverse', () => {
    const spyCacheRed = vi
      .spyOn(cacheRecord, 'read')
      .mockImplementationOnce(() => {
        return ['s2/s2a.mkv', 's2/s2b.mp4']
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
        "s2/s2c.m3",
      ]
    `)
    spyCacheRed.mockRestore()
  })
  test('should be passed with deleteDir', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        deleteDir: true,
      })
    ).toMatchInlineSnapshot(`
      [
        "d1/",
      ]
    `)
  })
  test('should be passed with include', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        include: ['**.mkv'],
      })
    ).toMatchInlineSnapshot(`
      [
        "d1/d1.mkv",
      ]
    `)
  })
  test('should be passed with exclude', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        exclude: ['**.mkv'],
      })
    ).toMatchInlineSnapshot(`
      [
        "d1/d2.mp4",
        "d1/b.iso",
      ]
    `)
  })
  test('should be passed with exclude and include', () => {
    expect(
      getRmFiles({
        ...baseOptions,
        exclude: ['**.mkv'],
        include: ['**.mkv', '**.mp4'],
      })
    ).toMatchInlineSnapshot(`
      [
        "d1/d2.mp4",
      ]
    `)
  })
})
