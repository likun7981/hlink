import fs from 'fs-extra'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { cachePath } from './paths.js'

export type CacheEntry = { source: string; target: string }
export type CacheRecord = string | CacheEntry

// 旧的字符串记录保留给反向修剪使用；新硬链只使用带目标路径的记录。
export const cacheRecord = {
  read(): CacheRecord[] {
    try {
      const entries = fs.readJSONSync(cachePath)
      if (!Array.isArray(entries)) throw new Error('硬链缓存必须是数组')
      return entries
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    }
  },
  write(entries: CacheRecord[]) {
    fs.ensureDirSync(path.dirname(cachePath))
    const temporary = `${cachePath}.${process.pid}.${randomBytes(6).toString(
      'hex'
    )}.tmp`
    try {
      fs.writeJSONSync(temporary, entries)
      fs.renameSync(temporary, cachePath)
    } finally {
      fs.removeSync(temporary)
    }
  },
}

export function isCached(
  entries: CacheRecord[],
  source: string,
  target?: string
) {
  return entries.some((entry) => {
    if (typeof entry === 'string') {
      return (
        target === undefined && path.resolve(entry) === path.resolve(source)
      )
    }
    return (
      entry &&
      typeof entry.source === 'string' &&
      typeof entry.target === 'string' &&
      path.resolve(entry.source) === path.resolve(source) &&
      (target === undefined ||
        path.resolve(entry.target) === path.resolve(target))
    )
  })
}

export async function saveCache(entries: CacheEntry[]) {
  if (!entries.length) return
  fs.ensureDirSync(path.dirname(cachePath))
  const lockPath = `${cachePath}.lock`
  const start = Date.now()
  let locked = false
  // 手动任务运行在子进程中，合并和写入需要跨进程互斥。
  while (!locked) {
    try {
      fs.mkdirSync(lockPath)
      locked = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      try {
        if (Date.now() - fs.statSync(lockPath).mtimeMs > 30000) {
          fs.rmdirSync(lockPath)
          continue
        }
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code === 'ENOENT') continue
        throw statError
      }
      if (Date.now() - start > 35000) throw new Error('等待硬链缓存写入超时')
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
  }
  try {
    const saved = cacheRecord.read()
    const keys = new Set(saved.map((entry) => JSON.stringify(entry)))
    for (const entry of entries) {
      const normalized = {
        source: path.resolve(entry.source),
        target: path.resolve(entry.target),
      }
      const key = JSON.stringify(normalized)
      if (!keys.has(key)) {
        saved.push(normalized)
        keys.add(key)
      }
    }
    cacheRecord.write(saved)
  } finally {
    fs.rmdirSync(lockPath)
  }
}

export const checkCache = (source: string, target?: string): boolean =>
  isCached(cacheRecord.read(), source, target)
