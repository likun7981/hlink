export namespace IHlink {
  export type FileRule = {
    type: 'keyword' | 'regex' | 'glob' | 'preset'
    values: string[]
    target?: 'filename' | 'parent' | 'relativePath'
    caseSensitive?: boolean
  }
  export type FileFilter = {
    /** 包含规则之间的关系；同一条规则的多个值始终为「任意一个」 */
    mode?: 'any' | 'all'
    rules?: FileRule[]
    /** 任意一条排除规则命中即排除 */
    exclude?: FileRule[]
  }
  export type Rule = {
    exts?: Array<string>
    globs?: Array<string>
  }
  export interface Options {
    /**
     * @description 原路径和目标路径的映射关系
     */
    pathsMapping: Record<string, string>
    /**
     * @description 包含
     */
    include?: Rule | string[] | string
    /**
     * @description 排除
     */
    exclude?: Rule | string[] | string
    /** 在 include/exclude 基础上进一步筛选文件 */
    fileFilter?: FileFilter
  }
}
