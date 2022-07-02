import { hlinkHomeDir } from '@hlink/core'
import path from 'node:path'

export default {
  logFile: path.join(hlinkHomeDir, 'serve.log'),
}
