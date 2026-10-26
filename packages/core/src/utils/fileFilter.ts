import path from 'node:path'
import micromatch from 'micromatch'
import { IHlink } from '../IHlink.js'

const presets: Record<string, string> = {
  jav: '(?:^|[^a-z0-9])(?:FC2[-_ ]?(?:PPV[-_ ]?)?\\d{5,8}|(?!(?:IMG|DSC|DSCF|DSCN|PHOTO|ISHOT|VIDEO|CLIP|SCREEN|PXL|DJI)[-_])[a-z]{2,8}[-_]\\d{3,6})(?=$|[^a-z0-9])',
  episode:
    '(?:^|[^a-z0-9])(?:S\\d{1,2}E\\d{1,3}|\\d{1,2}x\\d{1,3})(?=$|[^a-z0-9])',
  date: '(?:19|20)\\d{2}[-._](?:0[1-9]|1[0-2])[-._](?:0[1-9]|[12]\\d|3[01])',
  resolution: '(?:^|[^a-z0-9])(?:720p|1080[pi]|2160p|4k|8k)(?=$|[^a-z0-9])',
}

function compileRule(rule: IHlink.FileRule) {
  if (!rule || !['keyword', 'regex', 'glob', 'preset'].includes(rule.type)) {
    throw new Error('文件筛选规则类型无效')
  }
  if (
    !Array.isArray(rule.values) ||
    !rule.values.length ||
    rule.values.some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new Error('文件筛选规则至少需要一个非空匹配值')
  }
  const target = rule.target || 'filename'
  if (!['filename', 'parent', 'relativePath'].includes(target)) {
    throw new Error('文件筛选匹配范围无效')
  }
  if (
    rule.caseSensitive !== undefined &&
    typeof rule.caseSensitive !== 'boolean'
  ) {
    throw new Error('文件筛选 caseSensitive 必须是布尔值')
  }
  const sensitive = rule.caseSensitive === true
  const tests = rule.values.map((value) => {
    if (rule.type === 'keyword') {
      const keyword = sensitive ? value : value.toLowerCase()
      return (text: string) =>
        (sensitive ? text : text.toLowerCase()).includes(keyword)
    }
    if (rule.type === 'glob') {
      const matcher = micromatch.matcher(value, { nocase: !sensitive })
      return (text: string) => matcher(text)
    }
    let pattern = value
    if (rule.type === 'preset') {
      if (!Object.prototype.hasOwnProperty.call(presets, value)) {
        throw new Error(`未知的命名规则: ${value}`)
      }
      pattern = presets[value]
    }
    try {
      const regex = new RegExp(pattern, sensitive ? '' : 'i')
      return (text: string) => regex.test(text)
    } catch (error) {
      throw new Error(`文件筛选正则无效: ${value}`)
    }
  })
  return (fullPath: string, root: string) => {
    const relativePath = path.relative(root, fullPath).split(path.sep).join('/')
    const text =
      target === 'relativePath'
        ? relativePath
        : target === 'parent'
        ? path.dirname(relativePath) === '.'
          ? ''
          : path.basename(path.dirname(relativePath))
        : path.basename(fullPath)
    return tests.some((test) => test(text))
  }
}

/** 每次扫描只编译一次；配置无效时在扫描/执行前报错。 */
export default function compileFileFilter(filter?: IHlink.FileFilter) {
  if (filter === undefined) return () => true
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    throw new Error('文件筛选配置必须是对象')
  }
  if (filter.mode !== undefined && !['any', 'all'].includes(filter.mode)) {
    throw new Error('文件筛选组合方式必须为 any 或 all')
  }
  if (
    (filter.rules !== undefined && !Array.isArray(filter.rules)) ||
    (filter.exclude !== undefined && !Array.isArray(filter.exclude))
  ) {
    throw new Error('文件筛选 rules 和 exclude 必须是数组')
  }
  const rules = (filter.rules || []).map(compileRule)
  const excludes = (filter.exclude || []).map(compileRule)
  return (fullPath: string, root: string) =>
    !excludes.some((test) => test(fullPath, root)) &&
    (!rules.length ||
      (filter.mode === 'all'
        ? rules.every((test) => test(fullPath, root))
        : rules.some((test) => test(fullPath, root))))
}
