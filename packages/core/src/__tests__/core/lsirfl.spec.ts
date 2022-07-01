import { describe, test, vi, expect } from 'vitest'
import * as execa from 'execa'
import lsirfl from '../../core/lsirfl'

vi.mock('execa', () => ({
  execa: vi.fn(() => ({})),
}))

describe('lsirf tests', () => {
  test('should be passed', async () => {
    await lsirfl('path')
    expect(execa.execa).toHaveBeenCalledOnce()
    expect(execa.execa).toHaveBeenCalledWith('ls', ['-iRFL', 'path'])
  })

  test('should throw error when not ignore error', async () => {
    vi.spyOn(execa, 'execa').mockImplementationOnce(() => {
      throw new Error('ls error')
    })
    expect(async () => await lsirfl('path', false)).rejects.toThrowError(
      'ls error'
    )
  })

  test('should return empty string when ignore error', async () => {
    vi.spyOn(execa, 'execa').mockImplementationOnce(() => {
      throw new Error('ls error')
    })
    expect(await lsirfl('path', true)).toEqual('')
  })
})
