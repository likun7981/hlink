#!/bin/bash
set -x
##需要填的参数
DIR="/volume2/docker" ##如果是docker版的emby则需要填入该参数，填入config.yaml所在的文件夹
##DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"  ##如果是套件版的docker，则删除这行前面##，会自动在当前配置文件夹寻找config.yaml

##脚本相关内容
config="$DIR/config.yaml"   ##config的位置
cat $config
log="$DIR/emby.delete.log"
your_emby_delete_volume="$(grep '^emby_delete_volume=' $config | cut -d= -f2-)"   ##要删除的顶层目录
container_name="$(egrep "^container_name=" $config | cut -d= -f2-)"   ##对应做种器的容器名
delete_scripts="$(egrep '^delete_scripts=' $config | cut -d= -f2-)"   ##对应删除脚本在对应做种器的路径
exec >$log 2>&1
item_path="$1"
if [[ "$item_path" == "%item_path%" ]]
then
echo "误操作"
exit
fi
item_path="$(echo "$item_path"|sed -r "s#$your_emby_delete_volume##g"|sed -r "s#^/##g")"
docker exec $container_name /bin/bash -c "nohup bash $delete_scripts \"$item_path\""
echo "$item_path"
echo "结束本次运行"
set +x
