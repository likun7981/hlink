export namespace IHlink {
  export type Rule = {
    exts?: Array<string>
    globs?: Array<string>
  }
  export interface Options {
    /**
     * @description 原路径和目标路劲的映射关系
     */
    pathsMapping: Record<string, string>
    /**
     * @description 包含
     */
    include?: Rule
    /**
     * @description 排除
     */
    exclude?: Rule
  }
}
