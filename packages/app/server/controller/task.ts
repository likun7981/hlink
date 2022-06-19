import Router from '@koa/router'
import ConfigSDK from '../kit/ConfigSDK.js'
import { main } from '@hlink/core'

const config = new ConfigSDK()
const router = new Router({
  prefix: '/task',
})

router.post('/start', async (ctx) => {
  const { name, description } = ctx.request.body
  const configObj = await config.getOpt(name, description)
  await main(configObj)
  ctx.body = true
})

export default router.routes()
