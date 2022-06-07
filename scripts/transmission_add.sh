#!/bin/bash

##需要填的参数
##只需要填写config的参数就可以自动读取相关设置
##手动填config的位置
#config="/data/diy/config.yaml"   ##config的位置

##脚本所在路径
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置
log="$DIR/transmission_add.log"  ##add脚本运行历史
set -x
###从config读取到的参数
main_history="$(grep '^transmission_main_history=' $config | cut -d= -f2-)"  ##main脚本运行历史
IFS=$'\n'   #修改分隔符为换行符
your_category="$(grep '^your_category=' $config | cut -d= -f2-)"   ##脚本匹配处理的目录，总目录
exec > $log 2>&1
torrent_name="$TR_TORRENT_NAME"
hash="$TR_TORRENT_HASH"
torrent_path="$TR_TORRENT_DIR"
#torrent_name="生活大爆炸.全12季.The.Big.Bang.Theory.Complete.1080p.Blu-Ray.AC3.x265.10bit-Yumi"
#hash="f660cafb93798b10a83fde1577d66dfd105f38c4"
#torrent_path="/downloads/欧美剧/raw"
category="$(echo $torrent_path | egrep -o "$your_category")"
if [[ $(echo $category | egrep -c "$your_category") -eq 1 ]]; then
echo "满足目录要求"
if [[ $(cat $main_history | egrep -c "$hash") -eq 1 ]]; then
echo "已经存在"
else
echo "开始写入"
elements="$(cat "$main_history" | grep "$torrent_name" | head -n 1)"
elements_new="$(echo $elements | sed -r "s#hash:[^]]{8,}#hash:$hash#g")"
if [[ "$elements_new" != "" ]] 
then 
    echo $elements_new >> $main_history
fi

fi
fi
set +x
