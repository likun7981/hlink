import { cacheRecord } from '../paths.js'

export function saveCache(sourceCached: string[]) {
  const savedPath: string[] = cacheRecord.read()
  cacheRecord.write(Array.from(new Set([...savedPath, ...sourceCached ])))
}

export const checkCache = (source: string): boolean => {
  const savedPath: string[] = cacheRecord.read()
  return savedPath.indexOf(source) > -1;
}
