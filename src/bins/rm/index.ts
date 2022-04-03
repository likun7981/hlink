import helpText from './help.js'
import rm from './rm.js'
import { scan as scanHlink } from '../../config/createRecordHelp.js';
import path from 'path'

type Inputs = string[]

type Flags = Pick<IHlink.Flags, 'scan' | 'help' | 'all'>

export default (inputs: Inputs, flags: Flags) => {
  const [_path] = inputs
  const { help, scan, all } = flags
  if (help) {
    console.log(helpText)
    return
  }
  const absolutePath = path.resolve(_path)
  if (scan) {
    scanHlink()
  } else {
    rm(absolutePath, all)
  }
}
