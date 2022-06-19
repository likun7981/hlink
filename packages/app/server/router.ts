import { Router } from './kit/base.js'
import config from './controller/config.js'

const router = new Router({
  prefix: '/api',
})

router.use(config)

export default router
