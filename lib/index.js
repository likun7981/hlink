const fs = require("fs-extra");
const path = require("path");
const warning = require("./warning");
const execa = require("execa");
const log = require("./log");
const chalk = require("chalk");

const resolvePath = path.resolve;

function checkLevels(levels) {
  warning(Number.isNaN(levels), "保存的最大层级saveDirLevel必须设置为数字");
  warning(
    levels > 2 || levels < 0,
    "保存的最大层级saveDirLevel只能设置为0/1/2"
  );
}
function checkFindLevels(levels) {
  warning(Number.isNaN(levels), "查找的最大层级maxFindLevel必须设置为数字");
  warning(levels > 6 || levels < 1, "保存的最大层级maxFindLevel不能小于1大于6");
}

function checkDirectory(source, dest) {
  fs.ensureDirSync(dest);
  warning(source === dest, "起始地址和目标地址不能相同");
}

function getRealDestPath(sourcePath, destPath, saveLevels, startPath) {
  if (saveLevels > 0) {
    return path.resolve(
      destPath,
      path
        .relative(startPath, path.resolve(sourcePath))
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
  const { s, e, m } = options;
  const exts = e.split(",");
  const saveLevels = +s;
  const maxFindLevels = +m;
  checkLevels(saveLevels);
  checkFindLevels(maxFindLevels);
  const messageMap = {
    e: "  包含的后缀有：",
    m: "  源地址最大查找层级为：",
    s: "  硬链保存源地址的目录层级数为："
  };
  log.info("开始创建硬链...");
  log.info("当前配置为:");
  Object.keys(messageMap).forEach(k => {
    log.info(`${messageMap[k]}${chalk.cyanBright(options[k])}`);
  });
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
        // 做硬链接
        const realDestPath = getRealDestPath(
          sourcePath,
          dest,
          saveLevels,
          source
        );
        const sourceNameForMessage = chalk.yellow(
          path.relative(path.join(source, ".."), filePath)
        );
        const destNameForMessage = chalk.cyan(
          path.relative(path.join(dest, ".."), path.join(realDestPath, s))
        );
        try {
          fs.ensureDirSync(realDestPath);
          execa.sync("ln", [filePath, realDestPath]);
          log.success(
            `源地址 "${sourceNameForMessage}" 硬链成功, 硬链地址为 "${destNameForMessage}" `
          );
        } catch (e) {
          if (e.stderr.indexOf("File exists") === -1) {
            console.log(e);
          } else {
            log.warn(
              `目标地址 "${destNameForMessage}" 硬链已存在, 跳过源地址 "${sourceNameForMessage}" 硬链接创建`
            );
          }
        }
      }
    });
  }
  start(source);
}

module.exports = hardLink;
