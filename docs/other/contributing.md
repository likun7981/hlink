# 如何在hlink官方库，发布你的教程？
> 作者一个人精力有限，不能说清楚所有的事情，所以希望大家能一起来完善教程文档。
> 可以在这里提交一切与hlink相关或者PT相关的教程


这里出一个提文档到hlink官方仓库的过程，主要给第一次做提交的人，大佬请无视

## 1. fork官方仓库

![image](/fork.png)

如图点击右上角的fork按钮，进行fork仓库到你自己账号下面，选择归属的组织或者可以直接归属到你个人名下


## 2. 添加文件

打开你fork的仓库地址，找到`docs/other`目录，点击 `addFile` > `add new file`

![image](/createNewFile.png)

给教程文档取个`英文`名称必须以`.md` 为后缀

![image](/fileName.png)

在`docs/other/index.ts`里面加上文件名称和标题

![image](/setSideBar.png)


## 3. 开始编辑你的文档

接下来你就可以编写教程文档了，具体 markdown的语法可以见 [github markdown语法文档](https://docs.github.com/cn/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
编辑过程中你可以使用`Preview`进行预览
![image](/previewMd.png)


## 4. 编辑完成提交

在下面可以提交你编辑你编辑的文档标题和描述。点击`Commit new file`
![image](/commit.png)

## 5. 提交pr到官方仓库

你提交完成后，到下面的界面，点击`open pull request`
![image](/openPullRequest.png)

然后你会看到pull request的界面，点击`create pull request`
![image](/createPullRequest.png)

来到pr的创建界面，输入标题和描述，就可以提交了
![image](/submitPullRequest.png)

## 6. 等待审核及合并

提交完成后，就等待作者审核就可以了，到此结束！看到一下merged说明你的文档就合并完成了

等待部署完成，部署完成后，你就可以通过下面的按钮访问，能找到你的文档
![image](/complete.png)



## 7. 更新自己的仓库

![image](/update.png)

如果你前面已经提交过一个了，后面希望再提交，你只需要到你的仓库，点击更新拉取hlink主仓库的最新代码，然后从`第2步`开始执行即可




