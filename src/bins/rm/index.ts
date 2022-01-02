import helpText from './help.js'
import watchMode from './watch.js'
import rm from './rm.js'

type Inputs = string[]

type Flags = Pick<IHlink.Flags, 'watch' | 'help'>

export default (inputs: Inputs, flags: Flags) => {
  const [_path] = inputs
  const { help, watch } = flags
  if (help) {
    console.log(helpText)
    return
  }
  if (watch) {
    watchMode(_path)
  } else {
    rm(_path)
  }
}
