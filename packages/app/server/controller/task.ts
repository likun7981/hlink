import Router from '@koa/router'
import task from '../kit/TaskSDK.js'
import koaBody from 'koa-body'
import sse from '../middleware/sse.js'
import start from '../kit/exec.js'
import { chalk, logWrapper, deleteEmptyDir, rmFiles, log } from '@hlink/core'

const ongoingTasks: Partial<Record<string, ReturnType<typeof start> | null>> =
  {}

const waitingDeleteFiles: Partial<Record<string, string[] | null>> = {}

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
  if (cancel) {
    waitingDeleteFiles[name] = null
  } else {
    const deleteFiles = waitingDeleteFiles[name]
    if (deleteFiles) {
      await rmFiles(deleteFiles)
      await deleteEmptyDir(deleteFiles)
    }
    waitingDeleteFiles[name] = null
  }
  ctx.body = true
})

/**
 * @description 取消执行中的任务
 */
router.get('/cancel', async (ctx) => {
  const { name } = ctx.request.query as {
    name: string
  }
  const ongoingTask = ongoingTasks[name]
  if (ongoingTask) {
    if (ongoingTask.kill()) {
      ongoingTask.kill()
      ongoingTasks[name] = null
      ctx.body = true
    }
  } else {
    throw new Error('没有进行中的任务')
  }
})

/**
 * @description 开始执行任务
 */
router.get('/run', sse(), async (ctx) => {
  const { name, alive = '1' } = ctx.request.query as {
    name: string
    alive: '1' | '0'
  }
  const result = await task.getConfig(name)
  if (alive === '0') {
    const currentMonitor = start(result.command, {
      ...result.config,
      usedBy: 'terminal',
    })
    currentMonitor.handleLog((d) => {
      log.error('任务执行出错', name)
      console.log(d)
    })
    return currentMonitor.original
  }

  let currentMonitor = ongoingTasks[name]
  if (currentMonitor) {
    ctx.send?.({
      output: logWrapper.info(`任务 ${chalk.cyan(name)} 正在执行中..`),
      status: 'ongoing',
      type: result.command,
    })
  } else {
    currentMonitor = start(result.command, result.config)
  }
  ongoingTasks[name] = currentMonitor
  currentMonitor.handleLog((data) => {
    ctx.send?.({
      output: data,
      status: 'ongoing',
      type: result.command,
    })
  })
  // 接受prune传来的文件
  currentMonitor.original.on('message', (r) => {
    const files = r as string[]
    if (files.length) {
      waitingDeleteFiles[name] = r as string[]
    }
  })
  currentMonitor.original
    .then(async () => {
      ctx.send?.({
        status: 'succeed',
        type: result.command,
        output: waitingDeleteFiles[name]
          ? logWrapper.warn('请点击确认继续删除文件或者可以取消删除任务~')
          : undefined,
        confirm: !!waitingDeleteFiles[name],
      })
    })
    .catch((e) => {
      if (e.killed) {
        return ctx.send?.({
          status: 'failed',
          type: result.command,
          output: logWrapper.warn('已手动取消'),
        })
      } else {
        return ctx.send?.({
          status: 'failed',
          type: result.command,
          output: logWrapper.error('任务执行出错，已终止'),
        })
      }
    })
    .then(() => {
      ongoingTasks[name] = null
      ctx.sendEnd?.()
    })
})

export default router.routes()
