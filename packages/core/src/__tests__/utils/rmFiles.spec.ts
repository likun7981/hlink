import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import { rmFiles } from '../../utils/index.js'
import deleteEmptyDir from '../../prune/deleteEmptyDir.js'

describe('filesystem deletion', () => {
  let root: string
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'hlink-rm-'))
  })
  afterEach(async () => {
    await fs.remove(root)
  })

  test('handles duplicates, special filenames and empty input', async () => {
    const file = path.join(root, '-中文 file\n.txt')
    await fs.writeFile(file, '')
    await rmFiles([file, file])
    await rmFiles([])
    expect(await fs.pathExists(file)).toBe(false)
  })

  test('removes directories without following symlinks or deleting other hard links', async () => {
    const keep = path.join(root, 'keep')
    const dir = path.join(root, 'delete')
    await fs.ensureDir(dir)
    await fs.writeFile(keep, 'retained data')
    await fs.link(keep, path.join(dir, 'hardlink'))
    await fs.symlink(keep, path.join(dir, 'symlink'))
    await rmFiles([dir])
    expect(await fs.readFile(keep, 'utf8')).toBe('retained data')
    expect(await fs.pathExists(dir)).toBe(false)
  })

  test('propagates deletion failures', async () => {
    await expect(rmFiles([path.join(root, 'missing')])).rejects.toHaveProperty(
      'code',
      'ENOENT'
    )
  })

  test('removes nested empty directories but preserves populated siblings', async () => {
    const file = path.join(root, 'empty', 'nested', 'removed')
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(path.join(root, 'keep'), 'data')
    await deleteEmptyDir(root)
    expect(await fs.pathExists(path.join(root, 'empty'))).toBe(false)
    expect(await fs.pathExists(path.join(root, 'keep'))).toBe(true)
  })
})
