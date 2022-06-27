import { main, prune } from '@hlink/core'

let [_n, _p, _command, optionsStr] = process.argv
const options = JSON.parse(optionsStr)
if (_command === 'prune') {
  prune(options)
} else if (_command === 'main') {
  main(options)
} else {
  throw new Error('未知命令!')
}
