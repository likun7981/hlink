// Run after building @hlink/core. Uses temporary fixtures only.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { rmFiles } from '../packages/core/lib/utils/index.js'
import deleteEmptyDir from '../packages/core/lib/prune/deleteEmptyDir.js'

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hlink-e2big-'))
try {
  const keep = path.join(root, 'keep')
  const target = path.join(root, 'target')
  await fs.writeFile(keep, 'original content')
  await fs.mkdir(target)
  const paths = []
  for (let i = 0; i < 26000; i++) {
    const file = path.join(target, `${i}-${'中文 file '.repeat(8)}.txt`)
    await fs.link(keep, file)
    paths.push(file)
  }
  const control = spawnSync(process.execPath, ['-e', '', '--', ...paths])
  assert.equal(
    control.error?.code,
    'E2BIG',
    'fixture must exceed exec argument limit'
  )
  await rmFiles(paths)
  assert.deepEqual(await fs.readdir(target), [])
  assert.equal(await fs.readFile(keep, 'utf8'), 'original content')
  await fs.mkdir(path.join(target, 'nested', 'empty'), { recursive: true })
  await deleteEmptyDir(target)
  await assert.rejects(fs.stat(target), { code: 'ENOENT' })
  console.log(
    'PASS: 26000 hardlinks deleted beyond ARG_MAX; original data retained; empty directories removed'
  )
} finally {
  await fs.rm(root, { recursive: true, force: true })
}
