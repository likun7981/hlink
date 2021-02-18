# hlink

[![npm package][npm]][npm-url]
[![node version][node]][node-url]
[![npm download][npm-download]][npm-download-url]

## 所需环境：
nodejs 10 以上；

## 安装
```bash
$ npm install -g hlink

# 查看帮助

$ hlink --help
```
## 功能：
1. 批量创建源地址下面所有视频文件 硬链 到目标地址
2. 重复硬链检测，就算硬链接已改名也能检查到
3. 批量删除源地址在目标地址所创建的硬链

## 使用

![使用](./media/ghelp.png)

## 效果截图
![创建](./media/gcreate.png)

![重复创建](./media/gexist.png)

![删除目录](./media/gdeletedir.png)

![删除文件](./media/gdeletefile.png)

# License

[MIT][license-url]

[npm]: https://img.shields.io/npm/v/hlink.svg
[npm-url]: https://www.npmjs.com/package/hlink

[node]: https://img.shields.io/node/v/hlink.svg
[node-url]: https://nodejs.org

[npm-download-url]: https://npmjs.com/package/hlink
[npm-download]: https://img.shields.io/npm/dm/hlink.svg

[license-url]: https://github.com/likun7981/hlink/blob/master/LICENSE
[license]: http://img.shields.io/npm/l/hlink.svg?style=flat
