import { describe, test, expect } from 'vitest'
import getGlobs from '../../utils/getGlobs'

describe('getGlobs test', () => {
  test('should be an empty array', () => {
    expect(getGlobs()).toEqual([])
  })
  test('should be passed with exts', () => {
    expect(
      getGlobs({
        exts: ['mkv', 'mp4'],
      })
    ).toMatchInlineSnapshot(`
      [
        "**/*.mkv",
        "**/*.mp4",
      ]
    `)
  })
  test('should be passed with globs', () => {
    expect(
      getGlobs({
        globs: ['**/a/**'],
      })
    ).toMatchInlineSnapshot(`
      [
        "**/a/**",
      ]
    `)
  })

  test('should be passed with globs and exts', () => {
    expect(
      getGlobs({
        globs: ['**/a/**'],
        exts: ['mkv', 'mp4'],
      })
    ).toMatchInlineSnapshot(`
      [
        "**/a/**",
        "**/*.mkv",
        "**/*.mp4",
      ]
    `)
  })

  test('should be passed with defaultGlobs', () => {
    expect(getGlobs({}, ['ext1', 'ext2'])).toMatchInlineSnapshot(`
      [
        "ext1",
        "ext2",
      ]
    `)
  })

  test('should be passed with exts array string', () => {
    expect(getGlobs(['ext3', 'ext2'])).toMatchInlineSnapshot(`
      [
        "**/*.ext3",
        "**/*.ext2",
      ]
    `)
  })

  test('should be passed with string', () => {
    expect(getGlobs('**')).toMatchInlineSnapshot(`
      [
        "**",
      ]
    `)
  })
})
