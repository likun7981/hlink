import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = (metaUrl: string) => {
  return path.dirname(fileURLToPath(metaUrl))
}

export default dirname
