import { Router } from './kit/base.js'
import config from './controller/config.js'
import task from './controller/task.js'
import cache from './controller/cache.js'
import fs from 'fs-extra'
import dirname from './kit/__dirname.js'
import path from 'node:path'
import got from 'got'
import semver from 'semver'
import { execa, ExecaChildProcess } from 'execa'

const router = new Router({
  prefix: '/api',
})

const __dirname = dirname(import.meta.url)

router.use(config)
router.use(task)
router.use(cache)
const regex = /\d+\.\d+.\d+-([a-z]+)\.\d+/

router.get('/version', async (ctx) => {
  let { version, name } = fs.readJSONSync(
    path.join(__dirname, '../package.json')
  )
  const tag = version.match(regex)?.[1]
  let needUpdate = false
  try {
    const packageInfo = (
      await got
        .get(`https://registry.npmjs.org/${name}`)
        .json<{ 'dist-tags': NodeJS.Dict<string> }>()
    )['dist-tags']
    const npmVersion = packageInfo[tag] || packageInfo.latest
    if (npmVersion) {
      needUpdate = semver.compare(npmVersion, version) === 1
    }
    if (needUpdate) {
      version = npmVersion
    }
  } catch (e) {
    // ignore
  }

  ctx.body = {
    tag: tag || 'stable',
    version,
    needUpdate,
  }
})

let updatingProcess: ExecaChildProcess | null = null

router.get('/update', async (ctx) => {
  if (!updatingProcess) {
    updatingProcess = execa('npm', ['i', '-g', 'hlink'], {
      stdio: 'inherit',
    })
  }
  await updatingProcess
  updatingProcess = null
  ctx.body = true
})

export default router
