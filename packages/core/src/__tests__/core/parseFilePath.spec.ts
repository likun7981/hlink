import { describe, test, vi, expect } from 'vitest'
import parseFilePath from '../../core/parseFilePath'
import fs from 'fs-extra'

describe('parseFilePath test', () => {
  test('should be passed', () => {
    expect(parseFilePath('12345 a.js')).toMatchInlineSnapshot(`
      [
        "12345",
        "a.js",
      ]
    `)
    expect(
      parseFilePath(
        "1233  Sandra - (I'll Never Be) Maria Magdalena 2016 576i DVD MPEG PCM-PTerMV.vbo"
      )
    ).toMatchInlineSnapshot(`
      [
        "1233",
        " Sandra - (I'll Never Be) Maria Magdalena 2016 576i DVD MPEG PCM-PTerMV.vbo",
      ]
    `)
  })
  test('should return original file  with @ or * if file not exist', () => {
    expect(parseFilePath('12345 a.js@')).toMatchInlineSnapshot(`
      [
        "12345",
        "a.js",
      ]
    `)
    expect(parseFilePath('12345 a.js*')).toMatchInlineSnapshot(`
      [
        "12345",
        "a.js",
      ]
    `)
  })
  test('should return raw value  with @ or * if file exist', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(() => true)
    expect(parseFilePath('12345 a.js*')).toMatchInlineSnapshot(`
      [
        "12345",
        "a.js*",
      ]
    `)
    expect(parseFilePath('12345 a.js@')).toMatchInlineSnapshot(`
      [
        "12345",
        "a.js@",
      ]
    `)
    vi.restoreAllMocks()
  })
  test('should return false with an invalid inode', () => {
    expect(parseFilePath('a a.js@')).toBeFalsy()
  })
})
