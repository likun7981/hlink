const fs = require('fs-extra')
const path = require('path')
const configPath = require('./configPaths')

const pathsMap = fs.readJSONSync(configPath.mapJson)
function getSource (answers) {
  const isSecondDir = answers.sourcePath === '二级目录'
  const finalSourceDir = isSecondDir ? answers.secondDir : answers.sourcePath
  const sourceDir = isSecondDir ? path.dirname(finalSourceDir) : finalSourceDir
  return [finalSourceDir, sourceDir]
}

exports.getSource = getSource

exports.question = [
  {
    type: 'rawlist',
    name: 'sourcePath',
    message: '请选择需要删除硬链的源地址',
    choices: Object.keys(pathsMap).concat('二级目录')
  },
  {
    type: 'rawlist',
    name: 'secondDir',
    message: '请选择一个二级目录作为源地址',
    when: answer => {
      return answer.sourcePath === '二级目录'
    },
    choices: answer => {
      const file = Object.keys(pathsMap).map((k) =>
        fs.readdirSync(k).map((s) => path.join(k, s)).filter(s =>
          fs.statSync(s).isDirectory()
        )
      ).reduce((p, result) => {
        return result.concat(p)
      }, [])
      return file
    }
  },
  {
    type: 'rawlist',
    name: 'destDir',
    message: '该源地址对应两个目标地址，请选择一个',
    when: answer => {
      const choiceDest = pathsMap[getSource(answer)[1]]
      return choiceDest && choiceDest.length > 1
    },
    choices: answer => {
      return pathsMap[getSource(answer)[1]]
    }
  }
]
