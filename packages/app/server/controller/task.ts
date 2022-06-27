import Router from '@koa/router'
import task from '../kit/TaskSDK.js'
import koaBody from 'koa-body'
import { main, prune } from '@hlink/core'
import { PassThrough } from 'node:stream'
import EventEmitter from 'node:events'
import sse from '../middleware/sse.js'
import start from '../kit/exec.js'

const events = new EventEmitter()
events.setMaxListeners(0)

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

router.get('/run', sse(), async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }

  const result = await task.getConfig(name)

  try {
    await start(result.command, result.config, (data) => {
      ctx.json({
        output: data,
        type: 'ongoing',
      })
    })
    ctx.json({
      type: 'succeed',
    })
  } catch (e) {
    ctx.json({
      type: 'failed',
    })
  }
  ctx.jsonEnd()
})

export default router.routes()
