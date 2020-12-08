const fs = require("fs-extra");
const path = require("path");
const warning = require("./warning");
const execa = require("execa");
const log = require("./log");
const chalk = require("chalk");
const {
  checkLinkExist,
  checkDirectory,
  checkFindLevels,
  checkLevels,
  getLinkPath,
  getDirBasePath
} = require('./utils');
const getExts = require('./exts');
const updateSourceAndDest = require("./updateSourceAndDest");
const configPath = require("./configPath");
const inquirer = require('inquirer');

const resolvePath = path.resolve;


function getRealDestPath(sourcePath, destPath, saveLevels, startPath, s) {
  const relativePath = path
    .relative(startPath, path.resolve(sourcePath)) || s.replace(path.extname(s), '');
  return path.resolve(
    destPath,
    relativePath
      .split(path.sep)
      .slice(-saveLevels)
      .join(path.sep)
  );
  return destPath;
}

function getSource(answers) {
  const isSecondDir = answers.sourcePath === '二级目录';
  const finalSourceDir = isSecondDir ? path.join(answers.sourcePathSecond, answers.secondDir) : answers.sourcePath;
  const sourceDir = isSecondDir ? path.dirname(finalSourceDir) : finalSourceDir;
  return [finalSourceDir, sourceDir]
}

function parseInput(input) {
  if (input.length === 1) {
    return [resolvePath(process.cwd()), resolvePath(input[0])]
  } else if (input.length >= 2) {
    return [resolvePath(input[0]), resolvePath(input[1])]
  }
}

async function hardLink(input, options) {
  const { s, e, m, d } = options;
  let source = false;
  let dest = false;
  const isDelete = !!d;
  let deleteDir = false;
  let isSecondDir = false;
  let sourceDir = false;
  if (!isDelete) {
    warning(!input.length, "必须指定目标地址");
    const parsedPaths = parseInput(input);
    source = parsedPaths[0]
    sourceDir = parsedPaths[0]
    dest = parsedPaths[1]
  } else {
    const mapJsonNotExist = !fs.existsSync(configPath.mapJson)
    const noSaveRecord = !mapJsonNotExist && !Object.keys(fs.readJSONSync(configPath.mapJson)).length;
    warning((mapJsonNotExist || noSaveRecord) && !input.length, "你没有创建记录，你必须手动指定目标地址及源地址来进行删除操作");
    const answerDeleteMode = await inquirer.prompt([{
      type: 'rawlist',
      message: '请选择删除模式?',
      name: 'deleteDir',
      choices: ['仅仅删除文件', '删除硬链文件以及其所在目录'],
      default: '删除硬链文件以及其所在目录'
    }])
    deleteDir = answerDeleteMode.deleteDir === '删除硬链文件以及其所在目录';
    if (input.length) {
      const parsedPaths = parseInput(input);
      source = parsedPaths[0]
      sourceDir = parsedPaths[0]
      dest = parsedPaths[1]
    } else {
      const pathsMap = fs.readJSONSync(configPath.mapJson);
      const answers = await inquirer.prompt([{
        type: 'rawlist',
        name: 'sourcePath',
        message: '请选择需要删除硬链的源地址',
        choices: Object.keys(pathsMap).concat('二级目录')
      }, {
        message: '你需要选择哪个文件夹的二级目录',
        type: 'rawlist',
        name: 'sourcePathSecond',
        when: (answer) => {
          return answer.sourcePath === '二级目录'
        },
        choices: Object.keys(pathsMap).map(s => ({
          value: s,
          name: s + '的二级目录'
        }))
      }, {
        type: 'rawlist',
        name: 'secondDir',
        message: "请选择一个二级目录作为源地址",
        when: (answer) => {
          return !!answer.sourcePathSecond
        },
        choices: (answer) => {
          const file = fs.readdirSync(answer.sourcePathSecond).filter((s) => {
            return fs.statSync(path.join(answer.sourcePathSecond, s)).isDirectory()
          })
          return file
        }
      }, {
        type: 'rawlist',
        name: 'destDir',
        message: "该源地址对应两个目标地址，请选择一个",
        when: (answer) => {
          const choiceDest = pathsMap[getSource(answer)[1]];
          return choiceDest && choiceDest.length > 1;
        },
        choices: (answer) => {
          return pathsMap[getSource(answer)[1]]
        }
      }])
      const [realSource, createdSourceDir] = getSource(answers);
      source = realSource;
      sourceDir = createdSourceDir
      dest = answers.destDir || pathsMap[createdSourceDir][0];
      isSecondDir = answers.sourcePath === '二级目录'
    }
  }
  checkDirectory(source, dest);
  const exts = e.split(",");
  const saveLevels = +s;
  const maxFindLevels = +m;
  checkLevels(saveLevels);
  checkFindLevels(maxFindLevels);
  const messageMap = {
    e: "  包含的后缀有：",
    m: "  源地址最大查找层级为：",
    s: "  硬链保存模式："
  };
  if (!isDelete) {
    log.info("开始创建硬链...");
    log.info("当前配置为:");
    Object.keys(messageMap).forEach(k => {
      log.info(`${messageMap[k]}${chalk.cyanBright(options[k])}`);
    });
  } else {
    log.info("开始删除硬链...")
  }
  function start(sourcePath, currentLevel = 1) {
    if (currentLevel > maxFindLevels) {
      return;
    }
    const sourceDirContent = fs.readdirSync(sourcePath);
    sourceDirContent.forEach(async s => {
      const extname = path.extname(s).replace(".", "");
      const filePath = resolvePath(sourcePath, s);
      if (fs.lstatSync(filePath).isDirectory() && !s.startsWith(".")) {
        // 地址继续循环
        await start(filePath, currentLevel + 1);
      } else if (getExts(exts).indexOf(extname.toLowerCase()) > -1) {
        const realDestPath = getRealDestPath(
          sourcePath,
          dest,
          saveLevels,
          source,
          s,
        );
        if (isDelete) {
          // 删除硬链接
          try {
            const linkPaths = getLinkPath(filePath, dest, deleteDir)
            linkPaths.map((removePath) => {
              execa.sync('rm', ['-r', removePath])
              const deletePathMessage = chalk.cyan(getDirBasePath(dest, removePath));
              log.info(`${deleteDir ? '目录' : '硬链'} ${deletePathMessage} 已删除`)
            })
            // }
          } catch (e) {
            if (e.message === 'ALREADY_DELETE') {
              log.warn(`目录 ${chalk.cyan(getDirBasePath(dest, realDestPath))} 已删除`)
            }
          }
        } else {
          // 做硬链接
          const sourceNameForMessage = chalk.yellow(getDirBasePath(source, filePath));
          const destNameForMessage = chalk.cyan(getDirBasePath(dest, path.join(realDestPath, s)));
          try {
            if (checkLinkExist(filePath, dest)) {
              throw { stderr: 'File exists' }
            } else {
              fs.ensureDirSync(realDestPath);
            }
            execa.sync("ln", [filePath, realDestPath]);
            log.success(
              `源地址 ${sourceNameForMessage} 硬链成功, 硬链地址为 ${destNameForMessage}`
            );
          } catch (e) {
            if (!e.stderr) {
              console.log(e);
              process.exit(0);
            }
            if (e.stderr.indexOf("File exists") === -1) {
              console.log(e);
            } else {
              log.warn(
                `源地址"${sourceNameForMessage}"硬链已存在, 跳过创建`
              );
            }
          }
        }
      }
    });
  }
  start(source);
  updateSourceAndDest(sourceDir, dest, isDelete && !isSecondDir)
}

module.exports = hardLink;
