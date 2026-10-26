# 如何安装 nodejs

## 第一步、安装 nvm

- 非 Window 用户

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

- Windows 用户

[点击下载 nvm-windows](https://github.com/coreybutler/nvm-windows/releases/download/1.1.9/nvm-setup.exe)

## 第二步、使用`nvm`安装 nodejs

### 安装指定的 nodejs 版本

```bash
# 安装 Node.js 24 LTS 的最新补丁版
nvm install 24

# 或者你可以指定版本安装
nvm install 24.22.1

# 使用nvm查看已安装的包
nvm ls
```

### 选择指定的 node 版本

```bash
nvm use 24
## 或者你可以指定选择某个版本号
nvm use 24.22.1
## 查看node是否安装成功
node -v
```

### 指定默认的 nodejs 版本

```bash
## 指定 24 LTS 为默认版本
nvm alias default 24
```

::: warning 重要提醒
对于**威联通** root 用户在生成机器重启后，用户目录会被还原，所有安装会被清除。建议威联通用户不要用 root 用户，自建一个用户来使用
:::

仓库中的 `.nvmrc` 和 `.node-version` 固定当前验证的版本（24.22.1）。在仓库根目录执行 `nvm install && nvm use` 即可使用。

Docker 构建阶段和运行阶段均固定为 Node.js 24.22.1，并从当前仓库源码构建：

```bash
docker build -t hlink:node24 .
```

后续升级 24.x 补丁版时，可同步更新版本文件及 `Dockerfile` 中的 `NODE_VERSION`。

Node.js 24 镜像发布架构为 `linux/amd64` 和 `linux/arm64/v8`，不再发布 `arm/v6`、`arm/v7` 镜像。旧 ARM 设备需要继续使用兼容的历史版本。
