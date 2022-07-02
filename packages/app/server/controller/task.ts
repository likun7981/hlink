import Router from '@koa/router'
import task from '../kit/TaskSDK.js'
import koaBody from 'koa-body'
import sse from '../middleware/sse.js'
import { TTask } from '../../types/shim.js'

const router = new Router({
  prefix: '/task',
})

/**
 * @description 获取任务列表
 */
router.get('/list', async (ctx) => {
  ctx.body = await task.getList()
})

/**
 * @description 获取任务配置详情
 */
router.get('/', async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }
  ctx.body = await task.get(name)
})

/**
 * @description 创建任务
 */
router.post('/', koaBody(), async (ctx) => {
  task.add(ctx.request.body)
  ctx.body = true
})

/**
 * @description 修改任务
 */
router.put('/', koaBody(), async (ctx) => {
  const { preName, ...newConfig } = ctx.request.body
  await task.update(preName, newConfig)
  ctx.body = true
})

/**
 * @description 删除任务
 */
router.delete('/', async (ctx) => {
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

/**
 * @description prune任务确认删除文件
 */
router.delete('/files', async (ctx) => {
  const { name, cancel } = ctx.request.query as {
    name: string
    cancel: string
  }
  await task.confirmRemove(name, !!cancel)
  ctx.body = true
})

/**
 * @description 取消执行中的任务
 */
router.get('/cancel', async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }
  await task.cancel(name)
  ctx.body = true
})

/**
 * @description 开始执行任务
 */
router.get('/run', sse(), async (ctx) => {
  const { name, alive = '1' } = ctx.request.query as {
    name: string
    alive: '1' | '0'
  }
  if (alive === '0') {
    return task.start(name)
  } else {
    task.run(name, ctx)
  }
})

/**
 * @description 设置定时任务
 */
router.put('/schedule', koaBody(), async (ctx) => {
  const { name, scheduleType, scheduleValue } = ctx.request.body as TTask
  await task.schedule(name, scheduleType, scheduleValue)
  ctx.body = true
})

export default router.routes()
