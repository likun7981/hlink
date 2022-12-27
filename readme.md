<p align="center">
  <a href="https://hlink.likun.me" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://hlink.likun.me/logo.svg" alt="hlink logo">
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/hlink"><img src="https://img.shields.io/npm/v/hlink.svg" alt="npm package"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/hlink.svg" alt="node compatibility"></a>
  <a href="https://npmjs.com/package/hlink"><img src="https://img.shields.io/npm/dm/hlink.svg" alt="downloads"></a>
  <a href="https://github.com/likun7981/hlink/actions/workflows/publish.yml"><img src="https://github.com/likun7981/hlink/actions/workflows/publish.yml/badge.svg" alt="license"></a>
  <a href="https://github.com/likun7981/hlink/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/hlink.svg" alt="license"></a>
</p>

# hlink
> 批量、快速硬链工具(The batch, fast hard link toolkit)

- 💡 重复检测：支持文件名变更的重复检测
- ⚡️ 快速：`20000+`文件只需要1分钟
- 📦 多平台：支持Windows、Mac、Linux
- 🛠️ 丰富的配置：支持黑白名单，缓存等多个配置
- 🔩 修剪机制：让你更方便的同步源文件和硬链
- 🌐 WebUI：图形化界面让你更方便的管理
- 🐳 Docker：无需关心环境问题


更多介绍：https://hlink.likun.me

## 使用docker run
```bash
docker run -d --name hlink \
-e PUID=$YOUR_USER_ID \
-e PGID=$YOUR_GROUP_ID \
-e UMASK=$YOUR_UMASK \
-e HLINK_HOME=$YOUR_HLINK_HOME_DIR \
-p 9090:9090 \
-v $YOUR_NAS_VOLUME_PATH:$DOCKER_VOLUME_PATH \
likun7981/hlink:latest
```

## 使用docker compose
```yml
version: '2'

services:
  docker:
    image: likun7981/hlink:latest # docker镜像名称
    restart: on-failure
    ports: # 这个端口映射
      - 9090:9090
    volumes: # 这个表示存储空间映射
      - $YOUR_NAS_VOLUME_PATH:$DOCKER_VOLUME_PATH
    environment:
      - PUID=$YOUR_USER_ID
      - PGID=$YOUR_GROUP_ID
      - UMASK=$YOUR_UMASK
      - HLINK_HOME=$YOUR_HLINK_HOME_DIR # 这个是环境变量
```

`$YOUR_USER_ID`、`$YOUR_GROUP_ID`、`$YOUR_UMASK`、`$YOUR_HLINK_HOME_DIR`、`$YOUR_NAS_VOLUME_PATH`、`$DOCKER_VOLUME_PATH`为变量，根据自己的情况自行设置


## 使用npm安装
```bash
npm i -g hlink

# 帮助
hlink --help
```
<img src="https://user-images.githubusercontent.com/13427467/148177243-50ce207f-a31e-4a0a-b601-27ea9cbb1e1f.png" width="520"/>

## WebUI截图
<img src="https://user-images.githubusercontent.com/13427467/177048631-04dc6ace-af3a-4459-8848-13cc3c928856.png" width="520"/>

## 效果截图
<img src="https://user-images.githubusercontent.com/13427467/148171766-ccbe2a1a-c30c-4e1a-868c-4e2c69617d29.png" width="520"/>

## 打赏作者

请作者喝一杯咖啡😄

<img width="300" src="https://user-images.githubusercontent.com/13427467/148188331-c997f355-2a80-46b9-ba6b-d189186ac356.png" /><img width="300" src="https://user-images.githubusercontent.com/13427467/148188398-d6d9e8e5-bd75-4de4-9faa-dbd4846b4103.png" />

- 脱光游侠/诈尸求邀没结果 `16.60 RMB`
- 月与徘徊 `10.00 RMB`
- 庭下雀 `88.00 RMB`
- *宋 `30.00 RMB`
- *黑 `18.00 RMB`
- *宋 `20.00 RMB`
- *沐 `30.00 RMB`
- *春 `1.00 RMB`
- *卷 `20.00 RMB`
- H*r `20.00 RMB`
- *. `3.00 RMB`
- *府 `80.00 RMB`
- every*Ok `20.00 RMB`

感谢各位的支持，如果有遗漏，实在抱歉，可联系作者补充~


# License

[MIT](https://github.com/likun7981/hlink/blob/master/LICENSE)

