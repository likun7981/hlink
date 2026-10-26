import { describe, expect, test } from 'vitest'
import { isCached } from '../../utils/cacheHelp'

describe('destination-scoped cache', () => {
  test('the same source is independently cached for different targets', () => {
    const entries = [{ source: '/downloads/a.mkv', target: '/A/a.mkv' }]
    expect(isCached(entries, '/downloads/a.mkv', '/A/a.mkv')).toBe(true)
    expect(isCached(entries, '/downloads/a.mkv', '/B/a.mkv')).toBe(false)
    expect(isCached(entries, '/downloads/a.mkv', '/A/a/a.mkv')).toBe(false)
    expect(isCached(entries, '/downloads/a.mkv')).toBe(true)
  })

  test('legacy entries protect reverse prune but never block a new destination', () => {
    expect(isCached(['/downloads/a.mkv'], '/downloads/a.mkv')).toBe(true)
    expect(isCached(['/downloads/a.mkv'], '/downloads/a.mkv', '/B/a.mkv')).toBe(
      false
    )
  })
})
