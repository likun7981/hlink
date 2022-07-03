import Router from '@koa/router'
import fs from 'fs-extra'
import { cachePath } from '@hlink/core'
import koaBody from 'koa-body'

const router = new Router({
  prefix: '/cache',
})

router.get('/', async (ctx) => {
  ctx.body = (await fs.readFile(cachePath)).toString()
})

router.put('/', koaBody(), async (ctx) => {
  const { content } = ctx.request.body
  await fs.writeFile(cachePath, content)
  ctx.body = true
})

export default router.routes()
