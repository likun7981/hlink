import path from 'node:path'
import formatConfig from '../config/format.js'
import { getOriginalDestPath } from '../utils/index.js'
import analyse from './analyse.js'
import { IOptions } from './index.js'

export type PreviewFile = {
  source: string
  target: string
  status: 'pending' | 'exists' | 'cached' | 'excluded'
}
export type PreviewResult = {
  files: PreviewFile[]
  counts: Record<PreviewFile['status'], number>
  total: number
  truncated: boolean
}

/** 复用执行时的分析逻辑，只读扫描，不创建目录、硬链或缓存。 */
export default async function preview(
  options: IOptions,
  limit = 100
): Promise<PreviewResult> {
  const config = await formatConfig(options)
  const result: PreviewResult = {
    files: [],
    counts: { pending: 0, exists: 0, cached: 0, excluded: 0 },
    total: 0,
    truncated: false,
  }
  for (const [source, dest] of Object.entries(config.pathsMapping)) {
    const analysis = await analyse({ ...config, source, dest, readOnly: true })
    const groups: [PreviewFile['status'], string[]][] = [
      ['pending', analysis.waitLinkFiles.map((file) => file.sourcePath)],
      ['exists', analysis.existFiles],
      ['cached', analysis.cacheFiles],
      ['excluded', analysis.excludeFiles],
    ]
    for (const [status, files] of groups) {
      result.counts[status] += files.length
      result.total += files.length
      for (const file of files.slice(
        0,
        Math.max(0, limit - result.files.length)
      )) {
        result.files.push({
          source: file,
          target: path.join(
            getOriginalDestPath(
              file,
              source,
              dest,
              config.keepDirStruct ?? true,
              config.mkdirIfSingle ?? true
            ),
            path.basename(file)
          ),
          status,
        })
      }
    }
  }
  result.truncated = result.total > result.files.length
  return result
}
