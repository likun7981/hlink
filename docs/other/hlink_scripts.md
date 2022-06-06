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
> 推荐使用的该镜像[nevinee/qbittorrent](https://hub.docker.com/r/nevinee/qbittorrent)
- docker版的transmission进行辅种
- 群晖版EBMY

## 4.配置相关参数说明
大部分需要使用者配置的参数都独立出各个脚本，汇总到config.yaml里面


![image](/docs/img/config.yaml.png)

重点说明几个参数
your_path这个参数填入的是你的顶层目录
completed这个参数填入的是你的要硬链接的目录
your_Way这个参数填入的是你的媒体库类型。
上面这三个参数决定硬链接的路径，将路径拼接起来就是 ***/your_path/分类/completed***.***your_Way*** 这个参数决定分类在前还是completed在前

举一个栗子，甲下载的电影的位置放在 ***/downloads/电影/源文件/***，他需要将下载的电影硬链接到 ***/downloads/电影/硬链接/*** 里面。那么他的your_path=downloads,completed=硬链接，your_Way=$category/$completed。

换一个栗子，乙下载的电影的位置放在 ***/downloads/电影/源文件/***，他需要将下载的电影硬链接到 ***/downloads/硬链接/电影*** 里面。your_path=downloads,completed=硬链接,your_Way=$completed/$category。

qbittorrent_main_history和transmission_main_history这两个参数都是属于进阶功能删种参数，根据容器内的mian.history.log来填。
举一个栗子，我main脚本在qbittorrent里面运行，那么它产出的任务历史记录 ***main_history.log*** 就在main脚本所在路径 ***/data/diy/***，那么我qbittorrent_main_history填的就是 ***/data/diy/main_history.log***.我将qb的/data/diy/映射到tranmission的/mnt/脚本,所以我的transmission_main_history=/mnt/脚本/main_history.log

**建议所有分类your_category类的变量都使用中文，如图片里面一样，避免与种子里面的HDTV等关键字发生重合**

**没有用到的变量，请不要留空**

## 5.运行环境安装
**以下docker版安装命令都是需要在容器环境里面输入，请不要在宿主机内输入**
### - docker版的qbittorrent里面安装hlink和jq
1.首先判断你的内核是不是Alpine ***cat /etc/issue***，如果是Alpine就往下面看相关安装步骤，如果不是请自己寻找安装方法
2.输入**apk update**，更新软件包
3.依次输入**apk add nodejs**，**apk add npm**，**apk add jq**
4.最后输入**npm i -g hlink** 安装hlink

## 6
