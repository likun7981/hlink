import { describe, test, expect, vi, beforeEach } from 'vitest'
import analyse from '../../main/analyse'
import * as parse from '../../core/parseLsirfl'
import { cacheRecord } from '../../utils/cacheHelp'

function mockParse(s: { fullPath: string; inode: string }[], d: string[]) {
  vi.spyOn(parse, 'default').mockImplementation(async () => s)
  vi.spyOn(parse, 'getInodes').mockImplementation(async () => d)
}

describe('analyse test', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => 0)
    return () => {
      vi.restoreAllMocks()
    }
  })
  test('should waitLink some files', async () => {
    mockParse(
      [
        { fullPath: '/a/b', inode: '444555' },
        { fullPath: '/c/d', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } =
      await analyse({
        source: '',
        dest: '',
        include: ['**'],
        exclude: [],
      })
    expect(excludeFiles.length).toEqual(0)
    expect(existFiles.length).toEqual(0)
    expect(cacheFiles.length).toEqual(0)
    expect(waitLinkFiles.length).toEqual(2)
    expect(waitLinkFiles).toMatchInlineSnapshot(`
      [
        {
          "destDir": "/a",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/a/b",
        },
        {
          "destDir": "/c",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/c/d",
        },
      ]
    `)
  })
  test('should exist some files', async () => {
    mockParse(
      [
        { fullPath: '/a/b', inode: '123' },
        { fullPath: '/c/d', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } =
      await analyse({
        source: '',
        dest: '',
        include: ['**'],
        exclude: [],
      })
    expect(excludeFiles.length).toEqual(0)
    expect(existFiles.length).toEqual(1)
    expect(cacheFiles.length).toEqual(0)
    expect(waitLinkFiles.length).toEqual(1)
    expect(waitLinkFiles).toMatchInlineSnapshot(`
      [
        {
          "destDir": "/c",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/c/d",
        },
      ]
    `)
  })
  test('should exclude some files', async () => {
    mockParse(
      [
        { fullPath: '/a/b.mkv', inode: '1234' },
        { fullPath: '/c/d', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } =
      await analyse({
        source: '',
        dest: '',
        include: ['**.mkv'],
        exclude: [],
      })
    expect(excludeFiles.length).toEqual(1)
    expect(existFiles.length).toEqual(0)
    expect(cacheFiles.length).toEqual(0)
    expect(waitLinkFiles.length).toEqual(1)
    expect(waitLinkFiles).toMatchInlineSnapshot(`
      [
        {
          "destDir": "/a",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/a/b.mkv",
        },
      ]
    `)
  })
  test('should exclude some files', async () => {
    mockParse(
      [
        { fullPath: '/a/b.mkv', inode: '1234' },
        { fullPath: '/c/d.mp4', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } =
      await analyse({
        source: '',
        dest: '',
        include: ['**'],
        exclude: ['**.mkv'],
      })
    expect(excludeFiles.length).toEqual(1)
    expect(existFiles.length).toEqual(0)
    expect(cacheFiles.length).toEqual(0)
    expect(waitLinkFiles.length).toEqual(1)
    expect(waitLinkFiles).toMatchInlineSnapshot(`
      [
        {
          "destDir": "/c",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/c/d.mp4",
        },
      ]
    `)
  })
  test('should cache some files with openCache', async () => {
    vi.spyOn(cacheRecord, 'read').mockImplementationOnce(() => {
      return ['/c/d.mp4']
    })
    mockParse(
      [
        { fullPath: '/a/b.mkv', inode: '1234' },
        { fullPath: '/c/d.mp4', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } =
      await analyse({
        source: '',
        dest: '',
        include: ['**'],
        exclude: [],
        openCache: true,
      })
    expect(excludeFiles.length).toEqual(0)
    expect(existFiles.length).toEqual(0)
    expect(cacheFiles.length).toEqual(1)
    expect(waitLinkFiles.length).toEqual(1)
    expect(waitLinkFiles).toMatchInlineSnapshot(`
      [
        {
          "destDir": "/a",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/a/b.mkv",
        },
      ]
    `)
  })
  test('should not cache file without openCache', async () => {
    vi.spyOn(cacheRecord, 'read').mockImplementationOnce(() => {
      return ['/c/d.mp4']
    })
    mockParse(
      [
        { fullPath: '/a/b.mkv', inode: '1234' },
        { fullPath: '/c/d.mp4', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } =
      await analyse({
        source: '',
        dest: '',
        include: ['**'],
        exclude: [],
      })
    expect(excludeFiles.length).toEqual(0)
    expect(existFiles.length).toEqual(0)
    expect(cacheFiles.length).toEqual(0)
    expect(waitLinkFiles.length).toEqual(2)
    expect(waitLinkFiles).toMatchInlineSnapshot(`
      [
        {
          "destDir": "/a",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/a/b.mkv",
        },
        {
          "destDir": "/c",
          "originalDest": "",
          "originalSource": "",
          "sourcePath": "/c/d.mp4",
        },
      ]
    `)
  })
})
