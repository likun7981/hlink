// 重要说明路径地址都请填写 绝对路径！！！！
export default {
  /**
   * 源路径与目标路径的映射关系
   * 例子:
   *  pathsMapping: {
   *     '/path/to/exampleSource': '/path/to/exampleDest',
   *     '/path/to/exampleSource2': '/path/to/exampleDest2'
   *  }
   */
  pathsMapping: {},
  /**
   * 需要包含的后缀，如果与exclude同时配置，则取两者的交集
   * include 留空表示包含所有文件
   *
   * 后缀不够用? 高阶用法: https://hlink.likun.me/other/v2.html#%E6%96%B0%E5%A2%9E%E5%8A%9F%E8%83%BD
   */
  include: [
    'mp4',
    'flv',
    'f4v',
    'webm',
    'm4v',
    'mov',
    'cpk',
    'dirac',
    '3gp',
    '3g2',
    'rm',
    'rmvb',
    'wmv',
    'avi',
    'asf',
    'mpg',
    'mpeg',
    'mpe',
    'vob',
    'mkv',
    'ram',
    'qt',
    'fli',
    'flc',
    'mod',
    'iso',
  ],
  /**
   * 需要排除的后缀，如果与include同时配置，则取两者的交集
   *
   * 后缀不够用? 高阶用法: https://hlink.likun.me/other/v2.html#%E6%96%B0%E5%A2%9E%E5%8A%9F%E8%83%BD
   */
  exclude: [],
  /**
   * @scope 该配置项 hlink 专用
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
   * @scope 该配置项 hlink 专用
   * 是否打开缓存，为true表示打开
   * 可选值: true/false
   * 打开后，每次硬链后会把对应文件存入缓存，就算下次删除硬链，也不会进行硬链
   */
  openCache: false,
  /**
   * @scope 该配置项 hlink 专用
   * 是否为独立文件创建同名文件夹，为true表示创建
   * 可选值: true/false
   */
  mkdirIfSingle: true,
  /**
   * @scope 该配置项为 hlink prune 命令专用
   * 是否删除文件及所在目录，为false只会删除文件
   * 可选值: true/false
   */
  deleteDir: false,
}
