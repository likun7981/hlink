import { makeOnly } from './index.js'
import Config from './Config.js'

export const cacheRecord = new Config<Array<string>>('cache-array.json', [])

export function saveCache(sourceCached: string[]) {
  const savedPath: string[] = cacheRecord.read()
  cacheRecord.write(makeOnly([...savedPath, ...sourceCached]))
}

export const checkCache = (source: string): boolean => {
  const savedPath: string[] = cacheRecord.read()
  return savedPath.indexOf(source) > -1
}
