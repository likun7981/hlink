import { describe, test, vi, expect } from 'vitest'
import * as execa from 'execa'
import lsirfl from '../../core/lsirfl'

vi.mock('execa', () => ({
  execaSync: vi.fn(() => ({})),
}))

describe('lsirf tests', () => {
  test('should be passed', () => {
    lsirfl('path')
    expect(execa.execaSync).toHaveBeenCalledOnce()
    expect(execa.execaSync).toHaveBeenCalledWith('ls', ['-iRFL', 'path'])
  })

  test('should throw error when not ignore error', () => {
    vi.spyOn(execa, 'execaSync').mockImplementationOnce(() => {
      throw new Error('ls error')
    })
    expect(execa.execaSync).toThrowError('ls error')
  })

  test('should return empty string when ignore error', () => {
    vi.spyOn(execa, 'execaSync').mockImplementationOnce(() => {
      throw new Error('ls error')
    })
    expect(lsirfl('path', true)).toEqual('')
  })
})
