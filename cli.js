#!/usr/bin/env node
"use strict";
const meow = require("meow");
      const hardLink = require("./lib/index");

const cli = meow(
  `
	Usage
	  $ hlink [source] [dist]

	Options
	  --saveLevel,-l [Default: 1]
	    说明：如果源视频文件目录结构是 /share/download/movie/a.mkv，硬链接目的地目录是/share/media
	    saveLevel=2 时 结果就是 "/share/media/download/movie/a.mkv"
		  saveLevel=1 时 结果就是 "/share/media/movie/a.mkv"

    --ext,-e [Default: mkv,mp4,rmvb]
    --maxFindLevel [Default: 4]
`,
  {
    flags: {
      saveLevel: {
        type: "string",
        default: "1",
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
      }
    }
  }
);

hardLink(cli.input, cli.flags);
