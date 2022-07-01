import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default (metaUrl: string) => {
  return path.dirname(fileURLToPath(metaUrl))
}
