import { fileRecord, RecordType } from '../paths.js';
import { makeOnly } from '../utils.js'

export function saveFileRecord(
  sourceFile: string,
  destFile: string,
  number: string
) {
  const records = fileRecord.read()
  let index = -1
  const record = records.find(({ inode }, i) => {
    index = i
    return number === inode
  })

  if (record) {
    records[index] = {
      source: makeOnly([...record.source, sourceFile]),
      dest: makeOnly([...record.dest, destFile]),
      inode: number
    }
  } else {
    records.push({
      source: [sourceFile],
      dest: [destFile],
      inode: number
    })
  }
  fileRecord.write(records)
}

function filter(records: RecordType[], pathOrINode: string): RecordType[] {
  if (Number.isNaN(Number(pathOrINode))) {
    return records.filter(
      ({ source, dest }) =>
        makeOnly([...source, ...dest]).indexOf(pathOrINode) === -1
    )
  } else {
    return records.filter(({ inode }) => inode !== pathOrINode)
  }
}

export function deleteRecord(filepathOrINode: string | string[]) {
  let records = fileRecord.read()

  if (Array.isArray(filepathOrINode)) {
    filepathOrINode.forEach(n => {
      records = filter(records, n)
    })
  } else {
    records = records = filter(records, filepathOrINode)
  }

  fileRecord.write(records)
}

type FindResultType = { files: string[]; inodes: string[] }

function find(
  records: RecordType[],
  pathOrINode: string,
  delAll: boolean
): FindResultType {
  const inodes: string[] = []
  const files = makeOnly(
    records.reduce((result, { source, dest, inode }) => {
      if (
        Number.isNaN(Number(pathOrINode))
          ? makeOnly([...source, ...dest]).indexOf(pathOrINode) > -1
          : inode === pathOrINode
      ) {
        inodes.push(inode)
        result = result.concat(dest)
        // 是否删除源文件
        if (delAll) {
          result = result.concat(source)
        }
      }
      return result
    }, [] as string[])
  )
  return {
    inodes,
    files
  }
}

export function findFilesFromRecord(
  filepathOrINode: string | string[],
  delAll: boolean = false
) {
  const record = fileRecord.read()
  if (Array.isArray(filepathOrINode)) {
    return filepathOrINode.reduce(
      (result, file) => {
        const re = find(record, file, delAll)
        result.files = result.files.concat(makeOnly(re.files))
        result.inodes = result.inodes.concat(makeOnly(re.inodes))
        return result
      },
      { files: [], inodes: [] } as FindResultType
    )
  } else {
    return find(record, filepathOrINode, delAll)
  }
}
