#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置
log="$DIR/delete.log"  ##delete脚本运行历史
delete_log="$DIR/delete_history.log"  ##delete脚本运行历史
host="qbittorrent"  ##直接进行媒体库扫描
main_history="$(grep '^transmission_main_history=' $config | cut -d= -f2-)"  ##main脚本运行历史
your_category_movies="$(grep '^your_category_movies=' $config | cut -d= -f2-)"   ##把它当成电影进行硬链接的目录
chat_ID=1055256987	#用户ID或频道、群ID
TOKEN=5196391134:AAHVCEfVYmhq3XFJrg_rfM_zMI-AijmzsQo	#TG机器人token
IFS=$'\n'   #修改分隔符为换行符
exec >$log 2>&1
set -x
##登陆qbittorrent
SID="$(curl -i --header 'Referer: http://$host' --data 'username=admin&password=adminadmin' http://$host/api/v2/auth/login|egrep -o 'SID=.*'|sed -r 's#;.*##g')"
echo $SID
#find_name="/volume2/电影/completed/Everything Everywhere All at Once (2022)/Everything Everywhere All at Once (2022)-1080P.mkv"
date_new="$(date)"
find_name="$1"
echo "${date_new}本次运行查找以下内容进行删除:${find_name}" > $delete_log

if [[ $(echo $find_name | egrep -c "$your_category_movies") -eq 1 ]]; then     ##匹配电影
    echo "删除的是电影"
	find_name="$(echo "$find_name"|sed -r "s#^/[^/]*/(.*)#\1#g")"
    find_name=${find_name%/*}
else
    find_name="$(echo "$find_name"|sed -r "s#^/[^/]*/(.*)#\1#g")"
fi
###发送文件


for Element in `cat $main_history|grep  "$find_name"`;
do
echo "$Element"
IFS="$OLDIFS"  #还原IFS变量
IFS=$'\n'   #修改分隔符为换行符
torrent_hash="$(echo $Element|egrep -o 'hash:[0-9a-zA-z]{4,}'|sed -r "s#].*|hash:##g")"
path="$(echo $Element|egrep -o '路径:.*'|sed -r "s#].*|路径:##g")"
if [ -d "$path" -o -f "$path" ]; then
    echo "存在路径"
	a=0
else
    echo "不存在路径"
	a=1
	echo "$Element" >> $delete_log
    i=1
while ((i > 0))	
do
    curl -X POST --cookie "$SID" -d "hashes=$torrent_hash&deleteFiles=true" "http://$host/api/v2/torrents/delete"
	result="$(transmission-remote 192.168.1.196:9093 -t "$torrent_hash" -rad)"
	if [[ $(echo $result | egrep -c "success") -eq 1 ]]; then
	echo "成功删除"
	sed -i "/$torrent_hash/d" $main_history
	i=0
	fi
done
fi
done
cat $delete_log

while ((a > 0))	
do
	result="$(curl -F chat_id=$chat_ID -F document=@"$delete_log" https://api.telegram.org/bot$TOKEN/sendDocument)"
	if [[ $(echo $result | egrep -c "true") -eq 1 ]]; then
	echo "成功发送消息"
	a=0
	fi
done
echo "结束任务"
IFS="$OLDIFS"  #还原IFS变量
set +x