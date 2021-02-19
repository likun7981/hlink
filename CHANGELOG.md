#### v0.2.4
> 20201223
- __修复__: 保存相同源地址创建记录时报错的问题

#### v0.2.2
> 20201209
- __新增__：删除采用ui交互方式，不用担心创建的硬链目录记不住, 如果你是通过 `hlink` 创建的硬链，创建记录会被记录，可以使用 `hlink -d` 进行ui交互删除
![deleteUI](./media/deleteUi.png)
- __新增__：默认连接的文件后缀包含有了"mp4", "flv", "f4v", "webm", "m4v", "mov", "cpk", "dirac", "3gp", "3g2", "rm", "rmvb", "wmv", "avi", "asf", "mpg", "mpeg", "mpe", "vob", "mkv","ram", "qt", "fli", "flc", "mod", "iso"
- __修复__: 文件后缀大小写问题
- __修复__：创建的硬链被改名时，无法检测到，导致重复创建的问题

#### v0.2.1
> 20201212
- __修复__: 隐藏文件夹跳过处理


#### 20201216
- __优化__: 优化交互式删除二级目录选择步骤