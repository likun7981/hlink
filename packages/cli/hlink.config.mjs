// 重要说明路径地址都请填写 绝对路径！！！！
export default {
  /**
   * 源路径与目标路径的映射关系
   * 例子:
   *  pathsMapping: {
   *     源路径1:目标路径1
   *     源路径2:目标路径2
   *     源路径3:目标路径3
   *  }
   */
  pathsMapping: {
    '/Users/likun/Code/my-github/hlink/packages/cli/node_modules':
      '/Users/likun/Code/my-github/hlink/packages/cli/destDir',
    '/Users/likun/Code/my-github/hlink/node_modules':
      '/Users/likun/Code/my-github/hlink/packages/cli/destDir2',
  },
  /**
   * 需要包含的后缀，如果与exclude同时配置，则取两者的交集
   *
   * 后缀不够用? 高阶用法: todo 待补充链接
   */
  include: '**',
  /**
   * 需要排除的后缀，如果与include同时配置，则取两者的交集
   *
   * 后缀不够用? 高阶用法: todo 待补充链接
   */
  exclude: [],
  /**
   * 是否保持原有目录结构，为false时则只保存一级目录结构
   * 可选值: true/false
   * 例子：
   *  - 源地址目录为：/a
   *  - 目标地址目录为: /d
   *  - 链接的文件地址为 /a/b/c/z/y/mv.mkv；
   *  如果设置为true  生成的硬链地址为: /d/b/c/z/y/mv.mkv
   *  如果设置为false 生成的硬链地址为：/d/y/mv.mkv
   */
  keepDirStruct: true,
  /**
   * 是否打开缓存，为true表示打开
   * 可选值: true/false
   * 打开后，每次硬链后会把对应文件存入缓存，就算下次删除硬链，也不会进行硬链
   */
  openCache: false,
  /**
   * 是否为独立文件创建同名文件夹，为true表示创建
   * 可选值: true/false
   */
  mkdirIfSingle: true,
}
