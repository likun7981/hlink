#!/usr/bin/env node
"use strict";
const chalk = require("chalk");
const meow = require("meow");
const hardLink = require("./lib/index");

const cli = meow(
  `
  用法:
    $ hlink [--Options] [sourceDir] distDir

  可配置选项:
    --saveLevel,-l [Default: 0]
        ${chalk.gray(`saveLevel=2 只保存文件
        saveLevel=1 保存一级目录
        saveLevel=0 保存原有的相对源地址的路径`)}
    --ext,-e [Default: mkv,mp4,rmvb]
    --maxFindLevel,-m [Default: 4] 删除硬链
    --delete,-d 删除目标地址所有硬链
        ${chalk.gray(`delete=1 表示删除目录
        delete=0 表示只删除文件`)}
  例子:
    ${chalk.grey(`# 创建 /share/download 下面文件到目标地址 /share/movie`)}
    $ hlink /share/download /share/movie

    ${chalk.grey(`# 删除 /share/download 下面文件在 /share/movie 下面的对应硬链的文件夹`)}
    $ hlink -d=1 /share/download /share/movie


  说明:
    1. 创建硬链时，会自动检测硬链接是否存在，硬链改名同样能检测到
    2. sourceDir 不填，则表示 sourceDir 为当前 允许目录
`,
  {
    flags: {
      saveLevel: {
        type: "string",
        default: "0",
        alias: "s"
      },
      ext: {
        type: "string",
        default: "mkv,mp4,rmvb",
        alias: "e"
      },
      maxFindLevel: {
        type: "string",
        default: "4",
        alias: "m"
      },
      delete: {
        type: 'string',
        alias: 'd'
      }
    }
  }
);

hardLink(cli.input, cli.flags);
