import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'

async function getDefaultStr() {
  const content = await fs.readFile(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'hlink.config.tpl')
  )
  return content.toString()
}

export default getDefaultStr
