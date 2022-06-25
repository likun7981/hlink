import Router from '@koa/router'
import TaskSDK from '../kit/TaskSDK.js'
import koaBody from 'koa-body'

const task = new TaskSDK()
const router = new Router({
  prefix: '/task',
})

router.get('/list', async (ctx) => {
  ctx.body = await task.getList()
})

router.get('/', koaBody(), async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
    description: string
  }
  ctx.body = await task.get(name)
})

router.post('/', koaBody(), async (ctx) => {
  task.add(ctx.request.body)
  ctx.body = true
})

router.put('/', koaBody(), async (ctx) => {
  const { preName, ...newConfig } = ctx.request.body
  await task.update(preName, newConfig)
  ctx.body = true
})

router.delete('/', koaBody(), async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }
  await task.remove(name)
  ctx.body = true
})

export default router.routes()
