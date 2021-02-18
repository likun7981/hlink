// 重要说明路径地址都请填写 绝对路径！！！！
module.exports = {
  /**
   * 源地址：支持多地址，单地址
   *  多地址例子：
   *    source: ['/path1/to/aaa', '/path2/to/aaa']
   *  单地址例子:
   *    source: '/path/to/aaa'
   */
  source: '',
  /**
   * 同源地址一样支持多、单地址
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
   * 最大的查找目录级别, 最大为6，太大的话可能会卡死
   */
  maxFindLevel: 4,
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
  saveMode: 0
}
