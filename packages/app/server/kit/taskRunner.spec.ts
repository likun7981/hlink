import { describe, expect, test, vi } from 'vitest'
import { log } from '@hlink/core'
import taskRunner from './taskRunner.js'

describe('scheduled task runner', () => {
  test('contains failures and allows the next run', async () => {
    const logger = vi.spyOn(log, 'error').mockImplementation(() => {})
    try {
      const task = vi
        .fn()
        .mockRejectedValueOnce(new Error('failure'))
        .mockResolvedValue(undefined)
      const run = taskRunner('test', task)
      await expect(run()).resolves.toBeUndefined()
      await run()
      expect(task).toHaveBeenCalledTimes(2)
      expect(logger).toHaveBeenCalledTimes(1)
    } finally {
      logger.mockRestore()
    }
  })

  test('skips overlapping executions', async () => {
    let finish!: () => void
    const task = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        })
    )
    const run = taskRunner('test', task)
    const first = run()
    await run()
    expect(task).toHaveBeenCalledTimes(1)
    finish()
    await first
  })
})
