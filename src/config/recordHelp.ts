import { fileRecord, RecordType } from '../paths.js'

export function saveFileRecord(saveFiles: string[], number: string) {
  const record = fileRecord.read()
  let index = -1
  record.some(({ inode }, i) => {
    if (number === inode) {
      index = i
    }
    return number === inode
  })

  if (index !== -1) {
    record[index] = {
      files: Array.from(new Set([...record[index].files, ...saveFiles])),
      inode: number
    }
  } else {
    record.push({
      files: saveFiles,
      inode: number
    })
  }
  fileRecord.write(record)
}

function filter(records: RecordType[], pathOrNumber: string): RecordType[] {
  if (Number.isNaN(Number(pathOrNumber))) {
    return records.filter(({ files }) => files.indexOf(pathOrNumber) === -1)
  } else {
    return records.filter(({ inode }) => inode !== pathOrNumber)
  }
}

export function deleteRecord(filePathOrNumber: string | string[]) {
  let record = fileRecord.read()

  if (Array.isArray(filePathOrNumber)) {
    filePathOrNumber.forEach(n => {
      record = filter(record, n)
    })
  } else {
    record = record = filter(record, filePathOrNumber)
  }

  fileRecord.write(record)
}

function find(records: RecordType[], pathOrNumber: string): string[] {
  return Array.from(
    new Set(
      records.reduce((result, { files, inode }) => {
        if (
          Number.isNaN(Number(pathOrNumber))
            ? files.indexOf(pathOrNumber) > -1
            : inode === pathOrNumber
        ) {
          result = result.concat(files)
        }
        return result
      }, [] as string[])
    )
  )
}

export function findFiles(filePathOrNumber: string | string[]) {
  const record = fileRecord.read()
  if (Array.isArray(filePathOrNumber)) {
    return Array.from(
      new Set(
        filePathOrNumber.reduce((result, file) => {
          result = result.concat(find(record, file))
          return result
        }, [] as string[])
      )
    )
  } else {
    return find(record, filePathOrNumber)
  }
}
