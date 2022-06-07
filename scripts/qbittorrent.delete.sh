#!/bin/bash
set -x
##需要填的参数
##只需要填写config的参数就可以自动读取相关设置
##手动填config的位置
#config="/data/diy/config.yaml"   ##config的位置

##脚本所在路径
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置
log="$DIR/qbittorrent_delete.log"  ##delete脚本运行历史

###从config读取到的参数
main_log="$(grep '^qbittorrent_main_history=' $config | cut -d= -f2-)"  ##main脚本运行历史
host="$(grep '^qbittorrent_url=' $config | cut -d= -f2-)"  ##直接进行媒体库扫描
IFS=$'\n'   #修改分隔符为换行符
exec >$log 2>&1

##传递搜索参数到脚本,如果没有搜索参数就遍历整个日志，判断是否存在文件
find_name="$1"
##登陆qbittorrent
SID="$(curl -i --header 'Referer: http://$host' --data 'username=admin&password=adminadmin' http://$host/api/v2/auth/login|egrep -o 'SID=.*'|sed -r 's#;.*##g')"
echo $SID
for Element in `cat $main_log|grep  "$find_name"`;
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
	sed -i "/$torrent_hash/d" $(main_log)
	curl -X POST --cookie "$SID" -d "hashes=$torrent_hash&deleteFiles=true" "http://$host/api/v2/torrents/delete"
fi
done
IFS="$OLDIFS"  #还原IFS变量
set +x