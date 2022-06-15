import { describe, test, expect, vi } from 'vitest'
import execAsyncByGroup from '../../utils/execAsyncByGroup'
import { wait } from '../_utils'

describe('execAsyncByGroup', () => {
  test('should be pass with default options', async () => {
    const fn = vi.fn(wait)
    const total = 800
    const spare = 180
    const groupSize = 100
    const time = 5
    const arr = new Array(total + spare).fill(time)
    const count = await execAsyncByGroup({
      waitExecArray: arr,
      callback: fn,
      groupSize,
    })
    expect(fn).toHaveBeenCalledTimes(arr.length)
    expect(count).toEqual(Math.ceil((total + spare) / groupSize))
  })
})
