#!/usr/bin/env node
"use strict";
const meow = require("meow");
const hardLink = require("./lib/index");

const cli = meow(
  `
	Usage
    $ hlink [source] [dist]

  Options
    --saveLevel,-l [Default: 0]
        saveLevel=2 只保存文件
        saveLevel=1 保存一级目录
        saveLevel=0 保存原有的相对源地址的路径

    --ext,-e [Default: mkv,mp4,rmvb]
    --maxFindLevel,-m [Default: 4] 删除硬链
    --delete,-d 删除目标地址所有硬链
        delete=1 表示删除目录
        delete=0 表示只删除文件
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
