import { makeOnly } from './index.js'
import File from './File.js'

export const cacheRecord = new File<Array<string>>('cache-array.json', [])

export function saveCache(sourceCached: string[]) {
  const savedPath: string[] = cacheRecord.read()
  cacheRecord.write(makeOnly([...savedPath, ...sourceCached]))
}

export const checkCache = (source: string): boolean => {
  const savedPath: string[] = cacheRecord.read()
  return savedPath.indexOf(source) > -1
}
