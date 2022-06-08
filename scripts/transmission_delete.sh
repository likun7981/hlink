#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置
log="$DIR/transmission_delete.log"  ##delete脚本运行历史
host="qbittorrent"  ##直接进行媒体库扫描
main_history="$(grep '^transmission_main_history=' $config | cut -d= -f2-)"  ##main脚本运行历史
delete_log="$DIR/delete_history.log"  ##delete脚本运行历史
your_category_movies="$(grep '^your_category_movies=' $config | cut -d= -f2-)"   ##把它当成电影进行硬链接的目录
IFS=$'\n'   #修改分隔符为换行符
exec >$log 2>&1
##登陆qbittorrent
SID="$(curl -i --header 'Referer: http://$host' --data 'username=admin&password=adminadmin' http://$host/api/v2/auth/login|egrep -o 'SID=.*'|sed -r 's#;.*##g')"
echo $SID
echo "本次运行删除以下内容" > $delete_log
for Element in `cat $main_history`;
do
echo "$Element"
IFS="$OLDIFS"  #还原IFS变量
IFS=$'\n'   #修改分隔符为换行符
torrent_hash="$(echo $Element|egrep -o 'hash:[0-9a-zA-z]{4,}'|sed -r "s#].*|hash:##g")"
path="$(echo $Element|egrep -o '路径:.*'|sed -r "s#].*|路径:##g")"
if [ -d "$path" ]; then
    echo "存在路径"
else
    echo "不存在路径"
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
echo "结束任务"
IFS="$OLDIFS"  #还原IFS变量