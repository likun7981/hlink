# 如何安装nodejs

## 第一步、安装nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

## 第二步、使用`nvm`安装nodejs

### 安装指定的nodejs版本

```bash
# 安装最新的stable版本的nodejs
nvm install stable

# 或者你可以指定版本安装
nvm install 14

# 使用nvm查看已安装的包
nvm ls
```

### 选择指定的node版本

```bash
nvm use stable
## 或者你可以指定选择某个版本号
nvm use 14
## 查看node是否安装成功
node -v
```

### 指定默认的nodejs版本

```bash
## 指定14为默认的版本
nvm alias default 14
```

::: warning 重要提醒
对于**威联通** root用户在生成机器重启后，用户目录会被还原，所有安装会被清除。建议威联通用户不要用root用户，自建一个用户来使用
:::
