# 威联通自动关联环境变量
> 由于威联通重启后会重置部分配置，而且威联通安装node后默认没有设置环境变量，所以需要配置开机启动脚本来进行自动配置 hlink 到环境变量中，不然很麻烦

## 1. `ssh`登录你的威联通机器
执行以下命令

```bash
$ mount $(/sbin/hal_app --get_boot_pd port_id=0)6 /tmp/config
```

## 2. 编辑`autorun.sh`脚本

```bash
$ vim /tmp/config/autorun.sh
```

添加以下脚本到`autorun.sh`
```
ln -s  /share/CACHEDEV1_DATA/.qpkg/NodeJS/bin/hlink /usr/local/bin/hlink
```


其中`/share/CACHEDEV1_DATA/.qpkg/NodeJS/bin/hlink` 为你npm安装后的hlink 路径，根据各自的路径进行更换

## 3. 给`autorun.sh`添加执行权限
```
$ chmod +x /tmp/config/autorun.sh
```

## 4. 开启用户自定义脚本

`控制台` > `硬盘` > `启动时运行用户定义的进程` 打上勾，最后别忘记点击`应用`

![删除文件](/autorun.png)

## 5. 卸载`/tmp/config`

```bash
$ umount /tmp/config
```
