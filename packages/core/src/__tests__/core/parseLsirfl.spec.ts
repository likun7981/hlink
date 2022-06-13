import { describe, test, vi, expect, beforeAll } from 'vitest'
import parseLs, { getInodes } from '../../core/parseLsirfl'
import { getMockDir } from '../_utils'

const { mockDir, mockJoin } = getMockDir(import.meta.url)

describe('parseLsirfl test', () => {
  beforeAll(() => {
    return mockJoin()
  })

  test('parse should be passed', () => {
    expect(parseLs(mockDir)).toMatchInlineSnapshot(`
      [
        {
          "fullPath": "    Sandra - (I'll Never Be) Maria Magdalena 2016 576i DVD MPEG PCM-PTerMV.vbo",
          "inode": "4433243",
        },
        {
          "fullPath": "  aaa",
          "inode": "4414124",
        },
        {
          "fullPath": " aaa",
          "inode": "4414124",
        },
        {
          "fullPath": "a.js",
          "inode": "4414122",
        },
        {
          "fullPath": "aaa",
          "inode": "4414124",
        },
        {
          "fullPath": "b.mkv",
          "inode": "4414124",
        },
        {
          "fullPath": "index.js",
          "inode": "4414117",
        },
        {
          "fullPath": "dir1/c.mkv",
          "inode": "4415047",
        },
        {
          "fullPath": "dir1/dir2/d.mkv",
          "inode": "4415720",
        },
      ]
    `)
  })

  test('getInodes should be passed', () => {
    expect(getInodes(mockDir)).toMatchInlineSnapshot(`
      [
        "4433243",
        "4414124",
        "4414124",
        "4414122",
        "4414124",
        "4414124",
        "4414117",
        "4415047",
        "4415720",
      ]
    `)
  })
})
