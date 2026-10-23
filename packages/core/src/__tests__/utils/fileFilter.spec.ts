import { describe, expect, test } from 'vitest'
import compileFileFilter from '../../utils/fileFilter'

describe('file filters', () => {
  test('recognizes JAV identifiers without treating photo/screenshot names as codes', () => {
    const match = compileFileFilter({
      rules: [{ type: 'preset', values: ['jav'], target: 'relativePath' }],
    })
    for (const file of [
      'IPZZ-037/IPZZ-037-U.ltx.mp4',
      'mixed/MKMP-755.mp4',
      'FC2-PPV-3152570.mp4',
      'mixed/ssis_123.mkv',
      '[TEAM]START-123-C.mkv',
    ]) {
      expect(match(`/downloads/${file}`, '/downloads')).toBe(true)
    }
    for (const file of [
      'photo_123.jpg',
      'iShot_202610.png',
      'IMG-1234.jpg',
      'random/F9pwho6qr9mYpVCr.mp4',
      'Show.S01E02.mkv',
      'ABCD-123xyz.mp4',
    ]) {
      expect(match(`/downloads/${file}`, '/downloads')).toBe(false)
    }
    const other = compileFileFilter({
      exclude: [{ type: 'preset', values: ['jav'], target: 'relativePath' }],
    })
    expect(other('/downloads/IPZZ-037/video.mp4', '/downloads')).toBe(false)
    expect(other('/downloads/other/video.mp4', '/downloads')).toBe(true)
  })
  test('matches literal keyword lists without interpreting regex syntax', () => {
    const match = compileFileFilter({
      rules: [{ type: 'keyword', values: ['纪录片', '[TEAM]'] }],
    })
    expect(match('/downloads/纪录片.mkv', '/downloads')).toBe(true)
    expect(match('/downloads/[team].movie.mkv', '/downloads')).toBe(true)
    expect(match('/downloads/TEAM.movie.mkv', '/downloads')).toBe(false)
    expect(match('/downloads/纪录片/movie.mkv', '/downloads')).toBe(false)
  })

  test('combines rules with all and gives exclusions precedence', () => {
    const match = compileFileFilter({
      mode: 'all',
      rules: [
        { type: 'keyword', values: ['Documentary'] },
        { type: 'regex', values: ['S\\d{2}E\\d{2}'] },
      ],
      exclude: [{ type: 'keyword', values: ['trailer', '预告'] }],
    })
    expect(match('/d/Documentary.S01E02.mkv', '/d')).toBe(true)
    expect(match('/d/Documentary.mkv', '/d')).toBe(false)
    expect(match('/d/Documentary.S01E02.trailer.mkv', '/d')).toBe(false)
  })

  test('supports relative paths, parent names and case sensitivity', () => {
    expect(
      compileFileFilter({
        rules: [
          { type: 'glob', values: ['TV/**/*.mkv'], target: 'relativePath' },
        ],
      })('/d/tv/Show/1.mkv', '/d')
    ).toBe(true)
    expect(
      compileFileFilter({
        rules: [{ type: 'keyword', values: ['TV'], target: 'parent' }],
      })('/d/TV/1.mkv', '/d')
    ).toBe(true)
    expect(
      compileFileFilter({
        rules: [{ type: 'keyword', values: ['TV'], target: 'parent' }],
      })('/d/TV/Show/1.mkv', '/d')
    ).toBe(false)
    expect(
      compileFileFilter({
        rules: [{ type: 'keyword', values: ['TV'], target: 'parent' }],
      })('/TV/1.mkv', '/TV')
    ).toBe(false)
    expect(
      compileFileFilter({
        rules: [{ type: 'keyword', values: ['TV'], caseSensitive: true }],
      })('/d/tv.mkv', '/d')
    ).toBe(false)
  })

  test('supports naming presets and repeated regex matching', () => {
    const episode = compileFileFilter({
      rules: [{ type: 'preset', values: ['episode'] }],
    })
    expect(episode('/d/Show.S01E02.mkv', '/d')).toBe(true)
    expect(episode('/d/Show.1x02.mkv', '/d')).toBe(true)
    expect(episode('/d/Show_S01E02_1080p.mkv', '/d')).toBe(true)
    expect(episode('/d/Movie.mkv', '/d')).toBe(false)
    const date = compileFileFilter({
      rules: [{ type: 'preset', values: ['date'] }],
    })
    expect(date('/d/2026-10-23.mkv', '/d')).toBe(true)
    expect(date('/d/2026-99-99.mkv', '/d')).toBe(false)
    const regex = compileFileFilter({
      rules: [{ type: 'regex', values: ['S\\d+E\\d+'] }],
    })
    expect(regex('/d/S01E02.mkv', '/d')).toBe(true)
    expect(regex('/d/S01E02.mkv', '/d')).toBe(true)
  })

  test('an absent/empty include filter accepts all; excludes still apply', () => {
    expect(compileFileFilter()('/d/a', '/d')).toBe(true)
    expect(compileFileFilter({ rules: [] })('/d/a', '/d')).toBe(true)
    expect(
      compileFileFilter({ exclude: [{ type: 'keyword', values: ['sample'] }] })(
        '/d/sample.mkv',
        '/d'
      )
    ).toBe(false)
  })

  test('rejects malformed rules before scanning', () => {
    expect(() =>
      compileFileFilter({ rules: [{ type: 'regex', values: ['['] }] })
    ).toThrow('正则无效')
    expect(() =>
      compileFileFilter({ rules: [{ type: 'keyword', values: [] }] })
    ).toThrow('非空')
    expect(() =>
      compileFileFilter({ rules: [{ type: 'keyword', values: ['  '] }] })
    ).toThrow('非空')
    expect(() =>
      compileFileFilter({ rules: [{ type: 'preset', values: ['unknown'] }] })
    ).toThrow('未知的命名规则')
    expect(() => compileFileFilter({ mode: 'bad' } as any)).toThrow('组合方式')
  })
})
