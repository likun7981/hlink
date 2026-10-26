import { log } from '@hlink/core'

export default function taskRunner(
  name: string,
  runTask: () => void | Promise<void>
) {
  let running = false
  return async () => {
    if (running) return
    running = true
    try {
      await runTask()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.error('计划任务执行失败', name, message.slice(0, 500))
    } finally {
      running = false
    }
  }
}
