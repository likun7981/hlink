import { main, IPruneOptions, IOptions, prune } from '@hlink/core'

let [_n, _p, _command, optionsStr] = process.argv
const unknownOptions = JSON.parse(optionsStr) as unknown
if (_command === 'prune') {
  const options = unknownOptions as IPruneOptions
  prune(options, false).then((result) => {
    process.send?.(result)
  })
} else if (_command === 'main') {
  const options = unknownOptions as IOptions
  main(options)
} else {
  throw new Error('未知命令!')
}
