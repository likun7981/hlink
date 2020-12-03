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

const resolvePath = path.resolve;


function getRealDestPath(sourcePath, destPath, saveLevels, startPath, s) {
  if (saveLevels !== 2) {
    const relativePath = path
      .relative(startPath, path.resolve(sourcePath)) || s.replace(path.extname(s), '');
    return path.resolve(
      destPath,
      relativePath
        .split(path.sep)
        .slice(-saveLevels)
        .join(path.sep)
    );
  }
  return destPath;
}

function hardLink(input, options) {
  warning(!input.length, "必须指定目标地址");
  let source = resolvePath(process.cwd());
  let dest = false;
  if (input.length === 1) {
    dest = resolvePath(input[0]);
  } else if (input.length === 2) {
    source = resolvePath(input[0]);
    dest = resolvePath(input[1]);
  }
  checkDirectory(source, dest);
  const { s, e, m, d } = options;
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
  if (!d) {
    log.info("开始创建硬链...");
    log.info("当前配置为:");
    Object.keys(messageMap).forEach(k => {
      log.info(`${messageMap[k]}${chalk.cyanBright(options[k])}`);
    });
  } else {
    log.info("开始删除硬链...")
    log.info(`删除模式为: ${chalk.cyan(d === '0' ? '仅删除文件' : '删除对应目录')}`)
  }
  function start(sourcePath, currentLevel = 1) {
    if (currentLevel > maxFindLevels) {
      return;
    }
    const sourceDirContent = fs.readdirSync(sourcePath);
    sourceDirContent.forEach(s => {
      const extname = path.extname(s).replace(".", "");
      const filePath = resolvePath(sourcePath, s);
      if (fs.lstatSync(filePath).isDirectory() && !s.startsWith(".")) {
        // 地址继续循环
        start(filePath, currentLevel + 1);
      } else if (exts.indexOf(extname) > -1) {
        const realDestPath = getRealDestPath(
          sourcePath,
          dest,
          saveLevels,
          source,
          s,
        );
        if (!!d) {
          // 删除硬链接
          try {
            const linkPaths = getLinkPath(filePath, realDestPath, d === '1' && dest)
            if (!linkPaths.length) {
              log.warn(`没有找到 ${chalk.cyan(getDirBasePath(source, filePath))} 硬链接`);
            }
            linkPaths.map((removePath) => {
              execa.sync('rm', ['-r', removePath])
              const deletePathMessage = chalk.cyan(getDirBasePath(dest, removePath));
              if (d === '0') {
                log.info(`删除硬链文件成功 ${deletePathMessage} `)
              } else {
                log.info(`目录 ${deletePathMessage} 已删除`)
              }
            })
          } catch (e) {
            if (e.message === 'ALREADY_DELETE') {
              log.warn(`目录 ${chalk.cyan(getDirBasePath(dest, realDestPath))} 已删除`)
            }
          }
          return
        }
        // 做硬链接
        const sourceNameForMessage = chalk.yellow(getDirBasePath(source, filePath));
        const destNameForMessage = chalk.cyan(getDirBasePath(dest, path.join(realDestPath, s)));
        try {
          fs.ensureDirSync(realDestPath);
          if (checkLinkExist(filePath, realDestPath)) {
            throw { stderr: 'File exists' }
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
    });
  }
  start(source);
}

module.exports = hardLink;
