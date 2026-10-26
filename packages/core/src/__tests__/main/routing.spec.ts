import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import hlink from '../../main/hlink'
import preview from '../../main/preview'
import { cacheRecord } from '../../utils/cacheHelp'
import { cachePath } from '../../utils/paths.js'

vi.mock('../../utils/paths.js', async () => {
  const original = await vi.importActual<any>('../../utils/paths.js')
  const os = await import('node:os')
  return {
    ...original,
    cachePath: `${os.tmpdir()}/hlink-routing-cache-${
      process.pid
    }/cache-array.json`,
  }
})

describe('multiple tasks sharing a source directory', () => {
  let root: string
  let source: string
  let targetA: string
  let targetB: string

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'hlink-routing-'))
    source = path.join(root, 'downloads')
    targetA = path.join(root, 'A')
    targetB = path.join(root, 'B')
    await fs.ensureDir(source)
    await fs.writeFile(
      path.join(source, 'Documentary.S01E02.mkv'),
      'shared video'
    )
    await fs.writeFile(path.join(source, 'Documentary.mkv'), 'documentary')
    await fs.writeFile(path.join(source, 'Show.S01E02.mkv'), 'episode')
    await fs.writeFile(path.join(source, 'Documentary.trailer.mkv'), 'trailer')
    await fs.remove(path.dirname(cachePath))
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(async () => {
    vi.restoreAllMocks()
    await fs.remove(root)
    await fs.remove(path.dirname(cachePath))
  })

  const base = {
    include: ['**/*.mkv'],
    exclude: [],
    keepDirStruct: true,
    mkdirIfSingle: false,
    openCache: true,
  }

  test('overlapping matches link to both targets, preserve source and remain idempotent', async () => {
    const optionsA = {
      ...base,
      pathsMapping: { [source]: targetA },
      fileFilter: {
        rules: [{ type: 'keyword' as const, values: ['Documentary'] }],
        exclude: [{ type: 'keyword' as const, values: ['trailer'] }],
      },
    }
    const optionsB = {
      ...base,
      pathsMapping: { [source]: targetB },
      fileFilter: { rules: [{ type: 'preset' as const, values: ['episode'] }] },
    }
    expect((await hlink(optionsA)).successCount).toBe(2)
    expect((await hlink(optionsB)).successCount).toBe(2)
    const name = 'Documentary.S01E02.mkv'
    const stats = await Promise.all(
      [source, targetA, targetB].map((dir) => fs.stat(path.join(dir, name)))
    )
    expect(stats[0].ino).toBe(stats[1].ino)
    expect(stats[0].ino).toBe(stats[2].ino)
    expect(stats[0].nlink).toBe(3)
    expect(await fs.pathExists(path.join(targetA, 'Show.S01E02.mkv'))).toBe(
      false
    )
    expect(await fs.pathExists(path.join(targetB, 'Documentary.mkv'))).toBe(
      false
    )
    expect(
      await fs.pathExists(path.join(targetA, 'Documentary.trailer.mkv'))
    ).toBe(false)
    expect((await hlink(optionsA)).successCount).toBe(0)
    await fs.remove(path.join(targetA, name))
    expect((await hlink(optionsA)).successCount).toBe(0)
    expect(cacheRecord.read()).toHaveLength(4)
  })

  test('preview is read-only and uses the execution filters', async () => {
    const result = await preview(
      {
        ...base,
        include: ['mkv'],
        pathsMapping: { [source]: targetA },
        fileFilter: { rules: [{ type: 'regex', values: ['S\\d{2}E\\d{2}'] }] },
      },
      1
    )
    expect(result.counts).toEqual({
      pending: 2,
      excluded: 2,
      cached: 0,
      exists: 0,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].target).toBe(
      path.join(targetA, 'Documentary.S01E02.mkv')
    )
    expect(result.truncated).toBe(true)
    expect(await fs.pathExists(targetA)).toBe(false)
    expect(cacheRecord.read()).toEqual([])
  })

  test('a name collision is never cached or overwritten', async () => {
    await fs.ensureDir(targetA)
    await fs.writeFile(
      path.join(targetA, 'Documentary.mkv'),
      'existing unrelated file'
    )
    const options = {
      ...base,
      pathsMapping: { [source]: targetA },
      fileFilter: {
        rules: [{ type: 'regex' as const, values: ['^Documentary\\.mkv$'] }],
      },
    }
    const result = await hlink(options)
    expect(result.failCount).toBe(1)
    expect(cacheRecord.read()).toEqual([])
    expect(
      await fs.readFile(path.join(targetA, 'Documentary.mkv'), 'utf8')
    ).toBe('existing unrelated file')
    await fs.remove(path.join(targetA, 'Documentary.mkv'))
    expect((await hlink(options)).successCount).toBe(1)
  })
})
