/**
 *
 * !!!重要提醒：这是开发时使用的调试配置文件，不要直接使用，
 *
 * 请使用 hlink -g 生成使用
 *
 */
// 重要说明路径地址都请填写 绝对路径！！！！

export default {
  /**
   * 源地址
   */
  source: '/Users/likun/Code/my-github/hlink/sourceDir1',
  /**
   * 目标地址
   */
  dest: '/Users/likun/Code/my-github/hlink/destDir1',
  /**
   * 需要包含的后缀名,如果不配置该项，会采用以下策略
   *  1. 配置了excludeExtname，则链接文件为排除后的其他文件
   *  2. 未配置excludeExtname，则链接文件为目录下的所有文件
   */
  includeExtname: [],
  /**
   * 需要排除的后缀名, 如果配置了includeExtname则该配置无效
   */
  excludeExtname: [],
  /**
   * 0：保持原有的目录结构
   * 1：只保存一级目录结构
   * 默认为 0
   * 例子：
   *  - 源地址目录为：/a
   *  - 目标地址目录为: /d
   *  - 链接的文件地址为 /a/b/c/z/y/mv.mkv；
   *  如果保存模式为0 生成的硬链地址为: /d/b/c/z/y/mv.mkv
   *  如果保存模式为1 生成的硬链地址为：/d/y/mv.mkv
   */
  saveMode: 0,
  openCache: true,
  mkdirIfSingle: false,
  delete: true
}
