#!/bin/bash
set -x
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置
log="$DIR/awake_delete.log"
container_name="$(grep '^container_name=' $config | cut -d= -f2-)"   ##对应做种器的容器名
delete_scripts="$(grep '^delete_scripts=' $config | cut -d= -f2-)"   ##对应删除脚本在对应做种器的路径
exec >$log 2>&1
docker exec $container_name /bin/bash -c "nohup bash $delete_scripts"
echo "开始唤起删除脚本"
set +x