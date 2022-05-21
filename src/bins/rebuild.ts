import { fileRecord, newFileRecord } from '../paths.js'
import { findParent } from '../utils.js'

async function rebuild() {
  if (await fileRecord.exist()) {
    fileRecord.backup()
    try {
      const newRecord = fileRecord.read().map(item => {
        return {
          inode: item.inode,
          dest: findParent(item.dest),
          source: findParent(item.source)
        }
      })
      newFileRecord.write(newRecord)
    } catch (e) {
      fileRecord.restore()
    }
  }
}

export default rebuild;
