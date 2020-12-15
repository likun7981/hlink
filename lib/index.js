const fs = require('fs-extra')
const path = require('path')
const warning = require('./warning')
const execa = require('execa')
const log = require('./log')
const chalk = require('chalk')
const {
  checkLinkExist,
  checkDirectory,
  checkFindLevels,
  checkSaveMode,
  getLinkPath,
  getDirBasePath
} = require('./utils')
const getExts = require('./exts')
const updateSourceAndDest = require('./updateSourceAndDest')
const configPath = require('./configPath')
const inquirer = require('inquirer')
const prompt = require('./promptQuestion')
const startLog = require('./startLog')

const resolvePath = path.resolve

function getRealDestPath (sourcePath, destDir, saveMode, sourceDir, s) {
  const relativePath =
    path.relative(sourceDir, path.resolve(sourcePath)) ||
    s.replace(path.extname(s), '')
  return path.resolve(
    destDir,
    relativePath
      .split(path.sep)
      .slice(-saveMode)
      .join(path.sep)
  )
}

function parseInput (input, isDelete) {
  if (!isDelete) {
    warning(!input.length, '必须指定目标地址')
  }
  if (input.length === 1) {
    return [resolvePath(process.cwd()), resolvePath(input[0])]
  } else if (input.length >= 2) {
    return [resolvePath(input[0]), resolvePath(input[1])]
  } else {
    return []
  }
}

async function hardLink (input, options) {
  const isDelete = !!options.d
  let deleteDir = false
  let isSecondDir = false
  let [source, dest] = parseInput(input, isDelete)
  let sourceDir = source
  if (isDelete) {
    const mapJsonNotExist = !fs.existsSync(configPath.mapJson)
    const noSaveRecord =
      !mapJsonNotExist &&
      !Object.keys(fs.readJSONSync(configPath.mapJson)).length
    warning(
      (mapJsonNotExist || noSaveRecord) && !input.length,
      '你没有创建记录，你必须手动指定目标地址及源地址来进行删除操作'
    )
    const answerDeleteMode = await inquirer.prompt([
      {
        type: 'rawlist',
        message: '请选择删除模式?',
        name: 'deleteDir',
        choices: ['仅仅删除文件', '删除硬链文件以及其所在目录'],
        default: '删除硬链文件以及其所在目录'
      }
    ])
    deleteDir = answerDeleteMode.deleteDir === '删除硬链文件以及其所在目录'
    if (!input.length) {
      const pathsMap = fs.readJSONSync(configPath.mapJson)
      const answers = await inquirer.prompt(prompt.question)
      const [realSource, createdSourceDir] = prompt.getSource(answers)
      source = realSource
      sourceDir = createdSourceDir
      dest = answers.destDir || pathsMap[createdSourceDir][0]
      isSecondDir = answers.sourcePath === '二级目录'
    }
  }
  checkDirectory(source, dest)

  const { s, e, m } = options
  const exts = e.split(',')
  const saveMode = +s
  const maxFindLevels = +m
  checkSaveMode(saveMode)
  checkFindLevels(maxFindLevels)
  startLog(options, isDelete)
  function start (sourcePath, currentLevel = 1) {
    if (currentLevel > maxFindLevels) {
      return
    }
    const sourceDirContent = fs.readdirSync(sourcePath)
    sourceDirContent.forEach(async s => {
      const extname = path.extname(s).replace('.', '')
      const filePath = resolvePath(sourcePath, s)
      if (fs.lstatSync(filePath).isDirectory()) {
        if (!s.startsWith('.')) {
          await start(filePath, currentLevel + 1)
        }
        // 地址继续循环
      } else if (getExts(exts).indexOf(extname.toLowerCase()) > -1) {
        const realDestPath = getRealDestPath(
          sourcePath,
          dest,
          saveMode,
          source,
          s
        )
        if (isDelete) {
          // 删除硬链接
          try {
            const linkPaths = getLinkPath(filePath, dest, deleteDir)
            linkPaths.forEach(removePath => {
              execa.sync('rm', ['-r', removePath])
              const deletePathMessage = chalk.cyan(
                getDirBasePath(dest, removePath)
              )
              log.info(
                `${deleteDir ? '目录' : '硬链'} ${deletePathMessage} 已删除`
              )
            })
          } catch (e) {
            if (e.message === 'ALREADY_DELETE') {
              log.warn(
                `目录 ${chalk.cyan(getDirBasePath(dest, realDestPath))} 已删除`
              )
            }
          }
        } else {
          // 做硬链接
          const sourceNameForMessage = chalk.yellow(
            getDirBasePath(source, filePath)
          )
          const destNameForMessage = chalk.cyan(
            getDirBasePath(dest, path.join(realDestPath, s))
          )
          try {
            if (checkLinkExist(filePath, dest)) {
              const err = new Error('File exists')
              err.stderr = 'File exists'
              throw err
            } else {
              fs.ensureDirSync(realDestPath)
            }
            execa.sync('ln', [filePath, realDestPath])
            log.success(
              `源地址 ${sourceNameForMessage} 硬链成功, 硬链地址为 ${destNameForMessage}`
            )
          } catch (e) {
            if (!e.stderr || e.stderr.indexOf('File exists') === -1) {
              console.log(e)
              process.exit(0)
            }
            log.warn(`源地址"${sourceNameForMessage}"硬链已存在, 跳过创建`)
          }
        }
      }
    })
  }
  start(source)
  updateSourceAndDest(sourceDir, dest, isDelete && !isSecondDir)
}

module.exports = hardLink
