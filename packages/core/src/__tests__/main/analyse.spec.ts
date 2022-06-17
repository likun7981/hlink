import {
  describe,
  test,
  expect,
  vi,
  afterEach,
  beforeAll,
  beforeEach,
} from 'vitest'
import analyse from '../../main/analyse'
import * as parse from '../../core/parseLsirfl'
import { cacheRecord } from '../../utils/cacheHelp'

function mockParse(s: { fullPath: string; inode: string }[], d: string[]) {
  vi.spyOn(parse, 'default').mockImplementation(() => s)
  vi.spyOn(parse, 'getInodes').mockImplementation(() => d)
}

describe('analyse test', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => 0)
    return () => {
      vi.restoreAllMocks()
    }
  })
  test('should waitLink some files', () => {
    mockParse(
      [
        { fullPath: '/a/b', inode: '444555' },
        { fullPath: '/c/d', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } = analyse({
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
        "/a/b",
        "/c/d",
      ]
    `)
  })
  test('should exist some files', () => {
    mockParse(
      [
        { fullPath: '/a/b', inode: '123' },
        { fullPath: '/c/d', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } = analyse({
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
        "/c/d",
      ]
    `)
  })
  test('should exclude some files', () => {
    mockParse(
      [
        { fullPath: '/a/b.mkv', inode: '1234' },
        { fullPath: '/c/d', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } = analyse({
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
        "/a/b.mkv",
      ]
    `)
  })
  test('should exclude some files', () => {
    mockParse(
      [
        { fullPath: '/a/b.mkv', inode: '1234' },
        { fullPath: '/c/d.mp4', inode: '333444' },
      ],
      ['123', '456']
    )
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } = analyse({
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
        "/c/d.mp4",
      ]
    `)
  })
  test('should cache some files with openCache', () => {
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
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } = analyse({
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
        "/a/b.mkv",
      ]
    `)
  })
  test('should not cache file without openCache', () => {
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
    const { excludeFiles, existFiles, waitLinkFiles, cacheFiles } = analyse({
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
        "/a/b.mkv",
        "/c/d.mp4",
      ]
    `)
  })
})
