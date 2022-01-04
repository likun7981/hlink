import { cacheRecord } from '../paths.js'
import { makeOnly } from '../utils.js'

export function saveCache(sourceCached: string[]) {
  const savedPath: string[] = cacheRecord.read()
  cacheRecord.write(makeOnly([...savedPath, ...sourceCached ]))
}

export const checkCache = (source: string): boolean => {
  const savedPath: string[] = cacheRecord.read()
  return savedPath.indexOf(source) > -1;
}
