import { createRecord } from '../paths.js'
import fs from 'fs-extra'
import path from 'path'
import { makeOnly, rmFiles } from '../utils.js'
import { getList } from '../core/get.js'

export async function saveCreateRecord(
  destPath: string,
  sourcePath: string,
  inodes: string[]
) {
  if (!inodes.length) {
    return
  }
  let filename = destPath
  const creates = createRecord.read()
  const has = Object.keys(creates).some(create => {
    const include = filename.indexOf(create) > -1
    if (include) {
      filename = create
    }
    return include
  })
  if (has) {
    const record = creates[filename]

    createRecord.write({
      ...creates,
      [filename]: {
        sourcePaths: makeOnly([...record?.sourcePaths, sourcePath]),
        inodes: makeOnly([...record?.inodes, ...inodes])
      }
    })
  } else {
    createRecord.write({
      ...creates,
      [filename]: {
        sourcePaths: [sourcePath],
        inodes: inodes
      }
    })
  }
}

export async function scan() {
  const creates = createRecord.read()
  Object.keys(creates).forEach(async destDir => {
    const record = creates[destDir]
    const { inodes } = getList(destDir)
    const deleteInodes = record.inodes.filter(inode => !inodes.includes(inode))
    const allFiles = record.sourcePaths.reduce((needDeleteFile, sourcePath) => {
      const { inodeAndFileMap } = getList(sourcePath)
      deleteInodes.forEach(i => {
        if (inodeAndFileMap[i]) {
          needDeleteFile = needDeleteFile.concat(inodeAndFileMap[i])
        }
      })
      return needDeleteFile
    }, [] as string[])
    await rmFiles(allFiles)
  })
}
