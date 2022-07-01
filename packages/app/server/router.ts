import { Router } from './kit/base.js'
import config from './controller/config.js'
import task from './controller/task.js'

const router = new Router({
  prefix: '/api',
})

router.use(config)
router.use(task)

export default router
