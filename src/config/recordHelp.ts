import { fileRecord, RecordType } from '../paths.js'
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

function filter(records: RecordType[], pathOrNumber: string): RecordType[] {
  if (Number.isNaN(Number(pathOrNumber))) {
    return records.filter(
      ({ source, dest }) =>
        makeOnly([...source, ...dest]).indexOf(pathOrNumber) === -1
    )
  } else {
    return records.filter(({ inode }) => inode !== pathOrNumber)
  }
}

export function deleteRecord(filePathOrNumber: string | string[]) {
  let records = fileRecord.read()

  if (Array.isArray(filePathOrNumber)) {
    filePathOrNumber.forEach(n => {
      records = filter(records, n)
    })
  } else {
    records = records = filter(records, filePathOrNumber)
  }

  fileRecord.write(records)
}

type FindResultType = { files: string[]; inodes: string[] }

function find(
  records: RecordType[],
  pathOrNumber: string,
  deleteSource: boolean
): FindResultType {
  const inodes: string[] = []
  const files = makeOnly(
    records.reduce((result, { source, dest, inode }) => {
      if (
        Number.isNaN(Number(pathOrNumber))
          ? makeOnly([...source, ...dest]).indexOf(pathOrNumber) > -1
          : inode === pathOrNumber
      ) {
        inodes.push(inode)
        result = result.concat(dest)
        // 是否删除源文件
        if (deleteSource) {
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
  filePathOrNumber: string | string[],
  deleteSource: boolean = false
) {
  const record = fileRecord.read()
  if (Array.isArray(filePathOrNumber)) {
    return filePathOrNumber.reduce(
      (result, file) => {
        const re = find(record, file, deleteSource)
        result.files = result.files.concat(makeOnly(re.files))
        result.inodes = result.inodes.concat(makeOnly(re.inodes))
        return result
      },
      { files: [], inodes: [] } as FindResultType
    )
  } else {
    return find(record, filePathOrNumber, deleteSource)
  }
}
