import { cacheConfig } from './paths'

function saveCache(sourceCached: string[]) {
  const savedPath: string[] = cacheConfig.read()
  cacheConfig.write(Array.from(new Set([...savedPath, ...sourceCached ])))
}

export const checkCache = (source: string): boolean => {
  const savedPath: string[] = cacheConfig.read()
  return savedPath.indexOf(source) > -1;
}

export default saveCache
