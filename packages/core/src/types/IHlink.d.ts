declare namespace IHlink {
  type Rule = {
    exts?: Array<string>
    globs?: Array<string>
  }
  interface Options {
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
