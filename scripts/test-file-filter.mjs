// Run after building @hlink/core. Uses temporary fixtures only.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hlink-routing-'))
process.env.HLINK_HOME = path.join(root, 'cache')
const { main, preview, validateFileFilter } = await import(
  '../packages/core/lib/index.js'
)
const originalLog = console.log
console.log = () => {}
try {
  const sources = [path.join(root, 'xx'), path.join(root, 'bt')]
  await Promise.all(sources.map((source) => fs.mkdir(source)))
  await fs.writeFile(path.join(sources[0], 'IPZZ-037.mp4'), 'code')
  await fs.writeFile(path.join(sources[0], 'photo_123.jpg'), 'photo')
  await fs.writeFile(path.join(sources[1], 'FC2-PPV-3152570.mp4'), 'fc2')
  await fs.writeFile(path.join(sources[1], 'other.mp4'), 'other')
  const rule = { type: 'preset', values: ['jav'], target: 'relativePath' }
  const jav = {
    pathsMapping: Object.fromEntries(
      sources.map((source) => [source, path.join(root, 'jav')])
    ),
    fileFilter: { rules: [rule] },
    keepDirStruct: true,
    mkdirIfSingle: false,
    openCache: true,
  }
  const other = {
    ...jav,
    pathsMapping: Object.fromEntries(
      sources.map((source) => [source, path.join(root, 'other')])
    ),
    fileFilter: { exclude: [rule] },
  }
  const before = await preview(jav)
  assert.equal(before.counts.pending, 2)
  await assert.rejects(fs.stat(path.join(root, 'jav')), { code: 'ENOENT' })
  await main(jav)
  await main(other)
  assert.deepEqual((await fs.readdir(path.join(root, 'jav'))).sort(), [
    'FC2-PPV-3152570.mp4',
    'IPZZ-037.mp4',
  ])
  assert.deepEqual((await fs.readdir(path.join(root, 'other'))).sort(), [
    'other.mp4',
    'photo_123.jpg',
  ])
  assert.equal(
    (await fs.stat(path.join(sources[0], 'IPZZ-037.mp4'))).ino,
    (await fs.stat(path.join(root, 'jav', 'IPZZ-037.mp4'))).ino
  )
  assert.equal((await preview(jav)).counts.pending, 0)
  const overlap = { ...jav, fileFilter: {} }
  await main(overlap)
  assert.equal(
    (await fs.stat(path.join(root, 'jav', 'photo_123.jpg'))).ino,
    (await fs.stat(path.join(root, 'other', 'photo_123.jpg'))).ino
  )
  assert.throws(() =>
    validateFileFilter({ rules: [{ type: 'regex', values: ['['] }] })
  )
  console.log = originalLog
  console.log(
    'PASS: two source directories; JAV/complement rules; independent target caches; hardlink inodes; read-only preview; invalid regex rejection'
  )
} finally {
  console.log = originalLog
  await fs.rm(root, { recursive: true, force: true })
}
