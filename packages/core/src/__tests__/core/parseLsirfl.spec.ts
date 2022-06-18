import { describe, test, vi, expect } from 'vitest'
import parseLs, { getInodes } from '../../core/parseLsirfl'
import { strMapping } from '../_utils'

vi.mock('../../core/lsirfl.js', () => ({
  default: () => strMapping.s2,
}))

describe('parseLsirfl test', () => {
  test('parse should be passed', async () => {
    expect(await parseLs('s1')).toMatchInlineSnapshot(`
      [
        {
          "fullPath": "s1/s2a.mkv",
          "inode": "4445154",
        },
        {
          "fullPath": "s1/s2b.mp4",
          "inode": "4445155",
        },
        {
          "fullPath": "s1/s2c.m3",
          "inode": "4445153",
        },
      ]
    `)
  })

  test('getInodes should be passed', async () => {
    expect(await getInodes('s1')).toMatchInlineSnapshot(`
      [
        "4445154",
        "4445155",
        "4445153",
      ]
    `)
  })
})
