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

说明几个参数
your_path这个参数填入的是你的顶层目录
completed这个参数填入的是你的要硬链接的目录
your_Way这个参数填入的是你的媒体库类型。
上面这三个参数决定硬链接的路径，将路径拼接起来就是 ***/your_path/分类/completed***.***your_Way*** 这个参数决定分类在前还是completed在前

举一个栗子，甲下载的电影的位置放在 ***/downloads/电影/源文件/***，他需要将下载的电影硬链接到 ***/downloads/电影/硬链接/*** 里面。那么他的your_path=downloads,completed=硬链接，your_Way=$category/$completed。

换一个栗子，乙下载的电影的位置放在 ***/downloads/电影/源文件/***，他需要将下载的电影硬链接到 ***/downloads/硬链接/电影*** 里面。your_path=downloads,completed=硬链接,your_Way=$completed/$category。

qbittorrent_main_history和transmission_main_history这两个参数都是属于进阶功能删种参数，根据容器内的mian.history.log来填。
举一个栗子，我main脚本在qbittorrent里面运行，那么它产出的任务历史记录 ***main_history.log*** 就在main脚本所在路径 ***/data/diy/***，那么我qbittorrent_main_history填的就是 ***/data/diy/main_history.log***.我将qb的/data/diy/映射到tranmission的/mnt/脚本,所以我的transmission_main_history=/mnt/脚本/main_history.log

emby_delete_volume这个是顶层目录的参数，在emby删除内容时，唤起emby.delete.sh，往脚本传入媒体保存路径，脚本根据配置文件中的emby_delete_volume把媒体保存路径中的这个目录删掉，再将这个已经做了删减掉的目录传给对应的删除脚本，删种子。举一个栗子，我的emby是套件版，我要删除梦华录，在我删除这部剧的时候，emby带"/volume2/华语剧/硬链接/梦华录"这个参数唤起emby_delete_volume，然后再根据emby_delete_volume，把路径删减成"/华语剧/硬链接/梦华录"再唤起transmission的删除脚本，把原种子和辅种都删了

container_name这个填的你做种的下载器的容器名

delete_scripts这个填的是你删除脚本在下载器容器里的路径

**建议所有分类your_category类的变量都使用中文，如图片里面一样，避免与种子里面的HDTV等关键字发生重合**

**没有用到的变量，请不要留空**

## 5.运行环境安装
**注意群晖下面没办法跑该脚本，在docker容器里面运行正常**

**以下docker版安装命令都是需要在容器环境里面输入，请不要在宿主机内输入**
### - docker版的qbittorrent里面安装hlink和jq
1.首先判断你的内核是不是Alpine ***cat /etc/issue***，如果是Alpine就往下面看相关安装步骤，如果不是请自己寻找安装方法

2.输入**apk update**，更新软件包

3.依次输入**apk add nodejs**，**apk add npm**，**apk add jq**

4.最后输入**npm i -g hlink** 安装hlink

## 6.基本功能部署

**所有脚本都会在脚本所在生成运行日志，所有脚本都会在脚本所在查找config.yaml.所以只需要把脚本和config.yaml放在一起就行**

**基本功能所使用到的脚本有：[diy.sh](/scripts/diy.sh) [mian.sh](/scripts/main.sh) [config.yaml](/scripts/config.yaml) [emby.sh](/scripts/emby.sh)     config.yaml是相关使用参数存放

1. 如果使用的镜像是[nevinee/qbittorrent](https://hub.docker.com/r/nevinee/qbittorrent)，需要通过diy.sh来启动main.sh.不需要改动diy.sh,只需要改好config.yaml里面的参数，然后把所有涉及到脚本和config.yaml都移动到/data/diy。然后再根据下图内容填好qbittorrent，则完成基本功能部署
![image](/docs/img/qbittorrent.png)
如果不是使用该镜像，那在安装完运行环境之后，根据diy的注解，改变[diy.sh](/scripts/diy.sh)下载器传入参数，根据qbittorrent的说明来填写Torrent 完成时运行外部程序这个选项

## 7.进阶功能部署


**所有脚本都会在脚本所在生成运行日志，所有脚本都会在脚本所在查找config.yaml.所以只需要把脚本和config.yaml放在一起就行**

**所有功能进阶都基于EMBY来实现，并且需要在跑了我编写的脚本**

**进阶功能所使用到的脚本有：[transmission_add.sh](/scripts/transmission_add.sh) [qbittorrent_delete.sh](/scripts/qbittorrent_delete.sh) [transmission_delete.sh](/scripts/transmission_delete.sh) [emby_delete.sh](/scripts/emby_delete.sh) [config.yaml](/scripts/config.yaml)    config.yaml是相关使用参数存放

### 1.EMBY运行环境配置

- 下载[emby_delete.sh](/scripts/emby_delete.sh) [config.yaml](/scripts/config.yaml)，并改好config.yaml里面的emby.delete.sh脚本参数。放到emby能访问到的目录
- 在emby插件市场找到Emby Scripter-X并安装
- 在emby控制台的侧边栏，高级，找到Scripter-X → Actions，再找到onMediaItemRemoved
- 再按照下图填入，  **"%item.originaltitle%" "%item.library.name%" "%item.path%"**
- 打上右上角的钩
![image](/docs/img/emby.png)

### 2.qbittorrent环境配置

**以下涉及到的路径都是容器内路径**
（我往往是在qbittorrent下载，在transmission辅种）

如果使用的镜像是[nevinee/qbittorrent](https://hub.docker.com/r/nevinee/qbittorrent)，那么在下载完种子跑完脚本之后，会在/data/diy下面出现一个main_history.log。里面都是
脚本运行过的历史。
- 填好[config.yaml](/scripts/config.yaml)里面相对应的参数
- 将[qbittorrent_delete.sh](/scripts/qbittorrent_delete.sh)放到/data/diy下面

### 3.transmission环境配置

该环境配置难点在于需要将mian.sh运行后的任务历史main_history.log挂载进transmission容器内部。
举一个栗子，我的qbittorrent的mian.sh任务历史记录/data/diy/main_history.log,换成本地宿主机群晖的角度来看，就是在/volume2/docker/qbittorrent_追剧/data/diy/
我需要把这个路径挂载到transmission的/mnt/脚本里面。所以我将宿主机的/volume2/docker/qbittorrent_追剧/data/diy/挂载到了transmission的/mnt/脚本。
如下图(/docs/img/transmission_mount.png)
- 配置好transmission的main.history.log挂载和填写好config.yaml里面transmission_add.sh和transmission_delete.sh脚本参数
- 配置好transmission，如下图。在执行完校验任务之后，它会唤起transmission_add.sh将辅种的任务历史写入main.history.log里面，实现删辅种功能
![image](/docs/img/transmission_add.sh.png)

