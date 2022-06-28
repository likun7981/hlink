import Router from '@koa/router'
import task from '../kit/TaskSDK.js'
import koaBody from 'koa-body'
import EventEmitter from 'node:events'
import sse from '../middleware/sse.js'
import start from '../kit/exec.js'
import { chalk, getTag } from '@hlink/core'

const events = new EventEmitter()
events.setMaxListeners(0)
const ongoingTasks: Partial<Record<string, ReturnType<typeof start> | null>> =
  {}
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

router.get('/check_config', async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }
  await task.getConfig(name)
  ctx.body = true
})

router.get('/cancel', async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }
  const ongoingTask = ongoingTasks[name]
  if (ongoingTask) {
    ongoingTask.kill()
    ongoingTasks[name] = null
    ctx.body = true
  } else {
    throw new Error('没有进行中的任务')
  }
})

router.get('/run', sse(), async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }

  const result = await task.getConfig(name)
  let currentMonitor = ongoingTasks[name]
  if (currentMonitor) {
    ctx.send({
      output: `${getTag('INFO')} 任务 ${chalk.cyan(name)} 正在执行中..`,
      status: 'ongoing',
      type: result.command,
    })
  } else {
    currentMonitor = start(result.command, result.config)
  }
  ongoingTasks[name] = currentMonitor
  currentMonitor.handleLog((data) => {
    ctx.send({
      output: data,
      status: 'ongoing',
      type: result.command,
    })
  })
  currentMonitor.original
    .then(() => {
      ctx.send({
        status: 'succeed',
        type: result.command,
      })
    })
    .catch(() => {
      ctx.send({
        status: 'failed',
        type: result.command,
        output: `${getTag('WARN')} 已取消`,
      })
    })
    .finally(() => {
      ctx.sendEnd()
      ongoingTasks[name] = null
    })
})

export default router.routes()
