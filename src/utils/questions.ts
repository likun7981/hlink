import fs from 'fs-extra'
import path from 'path'
import inquirer from 'inquirer'
import * as paths from '../config/paths'

const pathsMap: Record<string, any> = fs.readJSONSync(paths.mapJson)

type Answers = {
  sourcePath: '二级目录' | string
  secondDir: string
  destDir: string
}

type AnswersDeleteMode = {
  deleteDir: '仅仅删除文件' | '删除硬链文件以及其所在目录'
}

export function getSource(answers: Answers) {
  const isSecondDir = answers.sourcePath === '二级目录'
  const source = isSecondDir ? answers.secondDir : answers.sourcePath
  const sourceDir = isSecondDir ? path.dirname(source) : source
  return [source, sourceDir]
}

export const deleteQuestion = async () => {
  return inquirer.prompt<Answers>([
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
      choices: () => {
        const file = Object.keys(pathsMap)
          .map(k =>
            fs
              .readdirSync(k)
              .map(s => path.join(k, s))
              .filter(s => fs.statSync(s).isDirectory())
          )
          .reduce((p, result) => {
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
  ])
}

export const deleteModeQuestion = async () => {
  return inquirer.prompt<AnswersDeleteMode>([
    {
      type: 'rawlist',
      message: '请选择删除模式?',
      name: 'deleteDir',
      choices: ['仅仅删除文件', '删除硬链文件以及其所在目录'],
      default: '删除硬链文件以及其所在目录'
    }
  ])
}
