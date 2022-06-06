# 基于Hlink的脚本

## 1.功能如下
#### 基本功能

- 根据种子任务的保存路径进行可定制化分类硬链接
- 根据种子名称对硬链接内容进行重命名整理，符合Emby刮削的内容格式
- 对接了EMBY的API，在进行硬链接之后，启动emby扫描媒体库，做到下载完则入库

#### 进阶功能

- 对接EMBY API，在删内容的同时，删除原种子，辅种和内容。做到一删则全删

## 2.脚本执行过程

基本功能：在qbittorrent完成任务时，启动脚本**main.sh**，自动对种子名称和种子内容进行处理，在对应的硬链接目录硬链接并进行改名整理，启动emby扫描刮削媒体库，最后再把运行历史写入到本地的历史纪录。
进阶功能：在EMBY删除媒体后，触发**emby.sh**.启动对应下载器的删种任务


## 3.运行环境

我的所有运行环境如下：
- docker版的qbittorrent进行下载 ***因此需要在docker的qbittorrent里面安装hlink和jq才能跑脚本***。
- > 推荐使用的该镜像[nevinee/qbittorrent](https://hub.docker.com/r/nevinee/qbittorrent)
