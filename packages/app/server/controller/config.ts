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
  const files = await config.getList()
  const list = files.map((file) => {
    const [name, description] = file.split('.')[0].split('-')
    return {
      name,
      description,
    }
  })
  ctx.body = list
})

router.get('/', koaBody(), async (ctx) => {
  const { name, description } = ctx.request.query as {
    name: string
    description: string
  }
  ctx.body = await config.get(name, description)
})

router.post('/', koaBody(), async (ctx) => {
  config.add(ctx.request.body)
  ctx.body = true
})

router.put('/', koaBody(), async (ctx) => {
  const { preName, preDescription, ...newConfig } = ctx.request.body
  await config.update(preName, preDescription, newConfig)
  ctx.body = true
})

router.delete('/', koaBody(), async (ctx) => {
  const { name, description } = ctx.request.query as {
    name: string
    description: string
  }
  await config.remove(name, description)
  ctx.body = true
})

export default router.routes()
