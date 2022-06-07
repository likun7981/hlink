#!/bin/bash

##脚本所在路径
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
diylog="$DIR/diy.log"  ###改这里，改diy.sh的运行日志存放地方

set -x
####下载器传入的参数
#下面对应获取种子对应QB的%I
torrent_hash="$1"
#下面对应获取种子名称对应QB的%N 
torrent_name="$2"
folder_name="$2"
#获取种子路径 对应QB的%F
torrent_path="$3"
#获取种子分类 对应QB的%L
Category="$5"
echo $torrent_path
echo $folder_name
echo $Category


        nohup bash /data/diy/main.sh "$torrent_name" "$folder_name" "$torrent_path" "$Category" "$torrent_hash" > $diylog 2>&1 &
		echo "开始执行主程序"
set +x

