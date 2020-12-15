// 常见在线流媒体格式"
module.exports = function getExts (extraExts) {
  return [
    'mp4', 'flv', 'f4v', 'webm',
    'm4v', 'mov', 'cpk', 'dirac',
    '3gp', '3g2', 'rm', 'rmvb',
    'wmv', 'avi', 'asf', 'mpg',
    'mpeg', 'mpe', 'vob', 'mkv',
    'ram', 'qt', 'fli', 'flc', 'mod', 'iso'
  ].concat(extraExts)
}
