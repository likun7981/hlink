// 重要说明路径地址都请填写 绝对路径！！！！
export default {
  /**
   * 源地址
   */
  source: '',
  /**
   * 目标地址
   */
  dest: '',
  /**
   * 需要包含的后缀名,如果不配置该项，会采用以下策略
   *  1. 配置了excludeExtname，则链接文件为排除后的其他文件
   *  2. 未配置excludeExtname，则链接文件为目录下的所有文件
   */
  includeExtname: ['mp4', 'flv', 'f4v', 'webm',
    'm4v', 'mov', 'cpk', 'dirac',
    '3gp', '3g2', 'rm', 'rmvb',
    'wmv', 'avi', 'asf', 'mpg',
    'mpeg', 'mpe', 'vob', 'mkv',
    'ram', 'qt', 'fli', 'flc', 'mod', 'iso'],
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
  /**
   * 是否打开缓存，默认打开
   *
   * 打开后，每次硬链后会把对应文件存入缓存，就算下次删除硬链，也不会进行硬链
   */
  openCache: false,
  /**
   * 是否为独立文件创建同名文件夹，默认创建
   */
  mkdirIfSingle: true,
}
