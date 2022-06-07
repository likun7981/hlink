#!/bin/bash
set -x
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置
log="$DIR/emby.delete.log"
your_emby_delete_volume="$(grep '^emby_delete_volume=' $config | cut -d= -f2-)"   ##要删除的顶层目录
container_name="$(grep '^container_name=' $config | cut -d= -f2-)"   ##对应做种器的容器名
delete_scripts="$(grep '^delete_scripts=' $config | cut -d= -f2-)"   ##对应删除脚本在对应做种器的路径

exec >$log 2>&1

item_path="/volume2/软件/电脑软件"
item_path="$(echo "$item_path"|sed -r "s#$your_emby_delete_volume##g"|sed -r "s#^/##g")"
docker exec $container_name /bin/bash -c "nohup bash $delete_scripts \"$item_path\""
echo "$item_path"
set +x
