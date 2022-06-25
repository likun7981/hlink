import Router from '@koa/router'
import ConfigSDK from '../kit/ConfigSDK.js'
import koaBody from 'koa-body'

const config = new ConfigSDK()
const router = new Router({
  prefix: '/config',
})

router.get('/default', async (ctx) => {
  ctx.body = await config.default()
})

router.get('/list', async (ctx) => {
  const list = await config.getList()
  ctx.body = list
})

router.get('/', koaBody(), async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
    description: string
  }
  ctx.body = await config.get(name)
})

router.post('/', koaBody(), async (ctx) => {
  await config.add(ctx.request.body)
  ctx.body = true
})

router.put('/', koaBody(), async (ctx) => {
  const { preName, ...newConfig } = ctx.request.body
  await config.update(preName, newConfig)
  ctx.body = true
})

router.delete('/', koaBody(), async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
    description: string
  }
  await config.remove(name)
  ctx.body = true
})

export default router.routes()
