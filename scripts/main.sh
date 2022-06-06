#!/bin/bash
##只需要填写config的参数就可以自动读取相关设置
##手动填config的位置
#config="/data/diy/config.yaml"   ##config的位置
set -x
##脚本所在路径
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
config="$DIR/config.yaml"   ##config的位置

###
log="$DIR/main.log"
log2="$DIR/main_history.log"
exec >$log 2>&1

####diy.sh传入参数
#获取种子名称对应QB的%N 
torrent_name="$1"
folder_name="$2"
#获取种子路径 对应QB的%F
torrent_path="$3"
#获取种子分类 对应QB的%L
Category="$4"
torrent_hash="$5"
echo $torrent_path
echo $folder_name
echo $Category




#####脚本参数填充（需要自己填）
######脚本相关路径和分类
####根据保存路径%F传入,通过抓取种子路径里相对应的关键字，来匹配对应的操作
#completed：硬链接目录，category：分类目录
your_path="$(grep '^your_path=' $config | cut -d= -f2-)"   ##设置最顶层目录
completed="$(grep '^completed=' $config | cut -d= -f2-)"
your_Way="$(grep '^your_Way=' $config | cut -d= -f2-)"
####根据保存路径%F传入,通过抓取种子路径里相对应的关键字，来匹配对应的操作
your_category="$(grep '^your_category=' $config | cut -d= -f2-)"   ##脚本匹配处理的目录，总目录
your_category_tv="$(grep '^your_category_tv=' $config | cut -d= -f2-)"   ##把它当成剧集进行硬链接的目录
your_category_KR="$(grep '^your_category_KR=' $config | cut -d= -f2-)"   ##把它当成韩剧进行硬链接的目录
your_category_zhcn="$(grep '^your_category_zhcn=' $config | cut -d= -f2-)" ##把它当成华语剧进行硬链接的目录
your_category_JP="$(grep '^your_category_JP=' $config | cut -d= -f2-)" ##把它当成日语剧进行硬链接的目录
your_category_movies="$(grep '^your_category_movies=' $config | cut -d= -f2-)"   ##把它当成电影进行硬链接的目录
your_category_direct="$(grep '^your_category_direct=' $config | cut -d= -f2-)"    ##直接进行硬链接的目录
your_category_emby="$(grep '^your_category_emby=' $config | cut -d= -f2-)"  ##直接进行媒体库扫描
your_Category="$(grep '^your_Category=' $config | cut -d= -f2-)"    ###读取qb的分类进行操作
####Emby参数填充####不想要进行硬链接的分类,通过QB传入的分类%L来抓取，
Emby="$(grep '^Emby=' $config | cut -d= -f2-)"
Emby_Apikey="$(grep '^Emby_Apikey=' $config | cut -d= -f2-)"
####日志文件存放处
#log="$(grep '^log=' $config | cut -d= -f2-)"
embylog="$DIR/emby.log"
tmdbjson="$DIR/tmdb.json"
###tmdb参数填充
api_key="$(grep '^api_key=' $config | cut -d= -f2-)"

#####下面的都不用管

################子函数定义区域
###URL重编码
urlencode() {
  local length="${#1}"
  for (( i = 0; i < length; i++ )); do
    local c="${1:i:1}"
    case $c in
      [a-zA-Z0-9.~_-]) printf "$c" ;;
    *) printf "$c" | xxd -p -c1 | while read x;do printf "%%%s" "$x";done
  esac
done
}
##emby刮削相关
Emby()
{
   curl -X POST "http://$Emby/emby/Library/Refresh?api_key=$Emby_Apikey" -H "accept: */*" -d ""
   exit
}
##Direct直接硬链接所有文件
Direct()
{
  folder_path="/$your_path/$category/$completed/$folder_name"
  echo "$folder_path"
  mkdir "$folder_path"
  hlink  "$torrent_path" "$folder_path"
}
##子函数定义Folder_extract_season 提取出季号
Folder_extract_season()
{
   season="$(echo $torrent_name | egrep -o 'S\d{2}')"
   season="$(echo $season |sed -r 's# ##g'|egrep -o '^S\d{2}')"
}
##子函数定义Folder_extract_year提取年份
Folder_extract_year()
{  
  if [[ $(ls "$torrent_path" | egrep -c 'mp4|mkv|ts|iso') -eq 0 ]] 
  then
  year="$(echo $torrent_name | sed -r 's#\d{4}p##g' | egrep -o '19\d{2}|20\d{2}')"
  year="$(echo $year |sed -r 's# ##g'|egrep -o '^\d{4}')"
  else
  year="$(echo $torrent_name | sed -r 's#\d{4}p##g' | egrep -o '19\d{2}|20\d{2}')"
  year="$(echo $year |sed -r 's# ##g'|egrep -o '\d{4}$')"
  fi
  if [[ $(echo $Category | egrep -c "$your_Category") -eq 1 ]]
  then
  echo "Vertex推送的种子获取年份"
  year="$(echo $Category | egrep -o '\d{4}$')"
fi
}
##子函数定义Folder_extract_resolution提取分辨率
Folder_extract_resolution()
{  
   resolution="$(echo $torrent_name | egrep -o '\d{4}[p,i,P,I]')"
   resolution="$(echo $resolution | sed -r 's#[a-z]#P#g')"
   echo "分辨率是"$resolution
   echo $resolution
}
###删除前后空格
Folder_extract_delete_space()
{
  name="$(echo $name | sed -r 's#^ +##g')"
  name="$(echo $name | sed -r 's# +$##g')"
}
tmdb_language_get()
{
   if [[ $(echo $category | egrep -c "$your_category_zhcn") -eq 1 ]]; then
   tmdb_language="zh|cn"
   fi
   if [[ $(echo $category | egrep -c "$your_category_KR") -eq 1 ]]; then
   tmdb_language="ko"
   fi
   if [[ $(echo $category | egrep -c "$your_category_JP") -eq 1 ]]; then
   tmdb_language="jp"
   fi
   
}
tmdb_season_convert()
{
  season_num="$(echo "$season_num"|sed -r "s#^0##g")"
  if [[ $season_num -eq 1 ]]; then
  Season_judge=0
  else
  Season_judge=$season_num-2
  fi
}
tmdb_translate()
{
tmdb_season_convert
tmdb_name_url="$(urlencode "$name")"
echo "$tv_name_url"
tmdb_language_get
   if [[ $(echo $category | egrep -c "$your_category_movies") -eq 1 ]]; then     ##匹配电影
   echo "$(curl -X GET "https://api.themoviedb.org/3/search/movie?api_key=$api_key&language=en-US&page=1&query=$tmdb_name_url&include_adult=false" -H "accept: application/json")" -> $tmdbjson
   echo "$(grep  -o "\[.*\]" $tmdbjson)" -> $tmdbjson
   echo "$(cat $tmdbjson | jq)"  -> $tmdbjson
   sed -i '$s#.*#]#g' $tmdbjson
   ###开始处理
   time="$(grep -c "genre_ids" $tmdbjson)"
   for i in $(seq 1 $time)
   do
   tmdb_name="$(jq '.['$(($i-1))'].title' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_oringnal_name="$(jq '.['$(($i-1))'].original_title' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_year="$(jq '{year:.['$(($i-1))'].release_date}' $tmdbjson|egrep -o '\d{4}')"
   if [[ $tmdb_year -eq $year ]]; then
   echo "符合年份要求"
   tmdb_translate_name=$tmdb_oringnal_name
   break
   else
   echo "不符合年份要求"
   continue
   fi
   done
   fi
   
   if [[ $(echo $category | egrep -c "$your_category_tv") -eq 1 ]]; then      	##匹配电视剧，
   echo "$(curl -X GET "https://api.themoviedb.org/3/search/tv?api_key=$api_key&language=en-US&page=1&query=$tmdb_name_url&include_adult=false" -H "accept: application/json")" -> $tmdbjson
   echo "$(grep  -o "\[.*\]" $tmdbjson)" -> $tmdbjson
   echo "$(cat $tmdbjson | jq)"  -> $tmdbjson
   sed -i '$s#.*#]#g' $tmdbjson
   ###开始处理
   time="$(grep -c "genre_ids" $tmdbjson)"
   for i in $(seq 1 $time)
   do
   echo $i
   tmdb_name="$(jq '.['$(($i-1))'].name' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_oringnal_name="$(jq '.['$(($i-1))'].original_name' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_year="$(jq '{year:.['$(($i-1))'].first_air_date}' $tmdbjson|egrep -o '\d{4}')"  
   tmdb_original_language="$(jq '.['$(($i-1))'].original_language' $tmdbjson| sed -r "s#[\'|\"]##g")"
   if [[ "$tmdb_language" != "" ]]; then 
   echo "有语言限制，开始判断语言"
       if [[ $(echo $tmdb_original_language | egrep -c "$tmdb_language") -eq 1 ]]; then
	   echo "正确匹配语言"
	   else
	   continue
	   fi
   fi
   if [[ $tmdb_year -ge $(($year-$Season_judge)) ]]; then
   echo "符合年份要求"
   else
   echo "不符合年份要求"
   continue
   fi
   if [ "$tmdb_name" == "$name" ]; then
   echo 正确匹配
   tmdb_translate_name=$tmdb_oringnal_name
   break
   fi
   if [ "$tmdb_oringnal_name" == "$name" ]; then
   echo 正确匹配
   tmdb_translate_name=$tmdb_oringnal_name
   break
   fi
   done
   fi
if [[ "$tmdb_translate_name" != "" ]] 
then 
    tmdb_first_name="$(echo $tmdb_translate_name | sed -r "s#\"##g")"
fi
}

tmdb()
{
tmdb_season_convert
tmdb_language_get
name_judge=$(echo "$name"  | sed -r "s#[ a-zA-Z0-9'-]+##g")
if [ ! -n "$name_judge" ]; then
    echo "是英文名"
	tmdb_translate
else
    echo "不是英文名"
	tmdb_first_name="$name"
fi
year_judge="$year"
tmdb_name_url="$(urlencode "$tmdb_first_name")"
echo "$tv_name_url"

   if [[ $(echo $category | egrep -c "$your_category_movies") -eq 1 ]]; then     ##匹配电影
   echo "$(curl -X GET "https://api.themoviedb.org/3/search/movie?api_key=$api_key&language=zh-CN&page=1&query=$tmdb_name_url&include_adult=false" -H "accept: application/json")" -> $tmdbjson
   echo "$(grep  -o "\[.*\]" $tmdbjson)" -> $tmdbjson
   echo "$(cat $tmdbjson | jq)"  -> $tmdbjson
   sed -i '$s#.*#]#g' $tmdbjson
   ###开始处理
   time="$(grep -c "genre_ids" $tmdbjson)"
   for i in $(seq 1 $time)
   do
   tmdb_name="$(jq '.['$(($i-1))'].title' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_oringnal_name="$(jq '.['$(($i-1))'].original_title' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_year="$(jq '{year:.['$(($i-1))'].release_date}' $tmdbjson|egrep -o '\d{4}')" 
   if [[ $tmdb_year -eq $year ]]; then
   echo "符合年份要求"
   else
   echo "不符合年份要求"
   continue
   fi
   if [ "$tmdb_name" == "$tmdb_first_name" ]; then
   echo 正确匹配
   tmdb_year_final="$(jq '{year:.['$(($i-1))'].release_date}' $tmdbjson|egrep -o '\d{4}')"
   tmdb_right_name=$tmdb_name
   break
   fi
   if [ "$tmdb_oringnal_name" == "$tmdb_first_name" ]; then
   echo 正确匹配
   tmdb_year_final="$(jq '{year:.['$(($i-1))'].release_date}' $tmdbjson|egrep -o '\d{4}')"
   tmdb_right_name=$tmdb_name
   break
   fi
   done
   fi
   
   if [[ $(echo $category | egrep -c "$your_category_tv") -eq 1 ]]; then      	##匹配电视剧，
   echo "$(curl -X GET "https://api.themoviedb.org/3/search/tv?api_key=$api_key&language=zh-CN&page=1&query=$tmdb_name_url&include_adult=false" -H "accept: application/json")" -> $tmdbjson
   echo "$(grep  -o "\[.*\]" $tmdbjson)" -> $tmdbjson
   echo "$(cat $tmdbjson | jq)"  -> $tmdbjson
   sed -i '$s#.*#]#g' $tmdbjson
   ###开始处理
   time="$(grep -c "genre_ids" $tmdbjson)"
   for i in $(seq 1 $time)
   do
   tmdb_name="$(jq '.['$(($i-1))'].name' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_oringnal_name="$(jq '.['$(($i-1))'].original_name' $tmdbjson| sed -r "s#[\'|\"]##g")"
   tmdb_year="$(jq '{year:.['$(($i-1))'].first_air_date}' $tmdbjson|egrep -o '\d{4}')"
   tmdb_original_language="$(jq '.['$(($i-1))'].original_language' $tmdbjson| sed -r "s#[\'|\"]##g")"
    if [[ "$tmdb_language" != "" ]]; then 
    echo "有语言限制，开始判断语言"
       if [[ $(echo $tmdb_original_language | egrep -c "$tmdb_language") -eq 1 ]]; then
	   echo "正确匹配语言"
	   else
	   continue
	   fi
   fi
   if [[ $tmdb_year -ge $(($year-$Season_judge)) ]]; then
   echo "符合年份要求"
   else
   echo "不符合年份要求"
   continue
   fi
   if [ "$tmdb_name" == "$tmdb_first_name" ]; then
   echo 正确匹配
   tmdb_year_final="$(jq '{year:.['$(($i-1))'].first_air_date}' $tmdbjson|egrep -o '\d{4}')"
   tmdb_right_name=$tmdb_name
   break
   fi
   if [ "$tmdb_oringnal_name" == "$tmdb_first_name" ]; then
   echo 正确匹配
   tmdb_year_final="$(jq '{year:.['$(($i-1))'].first_air_date}' $tmdbjson|egrep -o '\d{4}')"
   tmdb_right_name=$tmdb_name
   break
   fi
   done
   fi
if [[ "$tmdb_right_name" != "" ]] 
then 
    name="$(echo $tmdb_right_name | sed -r "s#\"##g")"
fi
if [ "$tmdb_year_final" != "" ] 
then 
    year_completed="($tmdb_year)"
fi      
}
###提取中文名
Folder_extract_chinese_name()
{
 ##预处理
  name="$(echo $name | sed -r 's#(Jade)|(AOD)|(TvbClassic)|(EBC)##g')"
  name="$(echo "$name" | sed -r "s#E\d+.*##g")"
if [[ $(echo "$name" | egrep -c "《.*》|[.*]") -eq 1 ]] ;then
     echo "有特殊标识"
	 name="$(echo "$name" | egrep -o "《.*》|[.*]")"
fi
 name="$(echo "$name" | sed -r 's# 第[一二三四]季|第[一二三四]季##g')" ##去掉可能带有的中文季号
 name="$(echo "$name" | sed -r 's#\[|\]|《|》|\($##g')" ##去掉一些奇怪符号
 Folder_extract_delete_space
 name_specials="$(echo "$name" | egrep -c "[^ a-zA-Z0-9]")"   ##为1则有原名
 name_specials2="$(echo "$name" | egrep -c "[a-zA-Z]")"       ##为1则有英文名
if [[ "$name_Vertex" != "" ]]; then   ###vertex推送的种子特殊取名
   name_specials=0
   name_specials2=0
   name="$name_Vertex"
   tmdb
   echo "名字是"$name 
fi
if [[ $name_specials -eq 1 && $name_specials2 -eq 1 ]] ;then
    echo "有原名和英文名"
    ###提取出对应的名字
    name="$(echo "$name" | sed -r 's#([^a-zA-z]+)( +)(.*)#\3#g')"
	Folder_extract_delete_space
	tmdb
	echo "名字是"$name 
elif [[ $name_specials -eq 1 && $name_specials2 -eq 0 ]] ;then
    echo "只有中文名"
	Folder_extract_delete_space
	tmdb
	echo "名字是"$name
elif [[ $name_specials -eq 0 && $name_specials2 -eq 1 ]] ;then    
    echo "只有英文名"
	Folder_extract_delete_space
	tmdb
	echo "名字是"$name 
fi
}
##子函数定义Folder_extract_name提取出剧集电影名字
Folder_extract_name()
{  
  unmatch=0
  name="$(echo $torrent_name | sed -r 's#\.# #g' )"
  Folder_extract_resolution
  if [ "$resolution" = "" ]; then
  echo "没有分辨率"
  resolution=""
  resolution_completed=""
  ((unmatch++))
  else
  echo "有分辨率" 
  resolution_completed="-$resolution"
  name="$(echo $name | sed -r "s/$resolution.*//g")" 
  echo $name 
  fi
  Folder_extract_year
  if [ "$year" = "" ]; then
  echo "没有年份"
  year=0
  year_completed=""
   ((unmatch++))
  echo $unmatch
  else
  echo "有年份"
  year_completed="($year)"
  name="$(echo $name | sed -r "s/$year.*//g")"  
  echo $name
  fi
  Folder_extract_season
  if [ "$season" = "" ]; then
  echo "没有季号"
  season="S01"
  season_num="$(echo $season |sed -r 's#S|^0##g')"
  ((unmatch++))
  else
  echo "有季号" 
  name="$(echo $name | sed -r "s/$season.*//g")" 
  season_num="$(echo $season |sed -r 's#S|^0##g')"
  echo $name
  fi
  ##判断有没有关键词
  if [ $(echo $name | egrep -c 'WEB-DL|Complete|REPACK|UHDTV|HDTV') -eq 0 ]; then
  echo  "没有关键词"
  ((unmatch++))
  else
  echo "有"
  name="$(echo $name | sed -r "s#WEB-DL.*|Complete.*|REPACK.*|UHDTV.*|HDTV.*|COMPLETE.*##g")"
  name="$(echo $name | sed -r "s#(UXN)|(Jade)|(AOD)|(TvbClassic)##g")"
  fi
  if [ $unmatch -gt 3 ]; then
  echo "完全没有规则"
  else
  echo "符合规则"
      Folder_extract_chinese_name	  
      echo $name
  
  fi
}
###File_rename_TV 剧集文件重命名
File_rename_TV()
{
  file_path="$1"   ###源地址
  folder_path="$2"  ###目的地址
  file_raw_name="$3"  ####是否为单文件
  season="$4"        ####传递进来的季号
  echo "第一个参数是$file_path"
  echo "第二个参数是$folder_path"
  echo "第三个参数是$file_raw_name"
  echo "第四个参数是$season"
  if [ "$file_raw_name" = "" ]
  then
  echo "****开始批量重命名****"
  cd "$file_path"
  OLDIFS="$IFS"  #备份旧的IFS变量
  IFS=$'\n'   #修改分隔符为换行符
  for raw_name in `ls |egrep "mp4$|mkv$|iso|ts$"`;
  do
  cd  "$folder_path"
  Episode="$(echo "$raw_name" | egrep -o 'E\d+|EP\d+|SP\d+|Ep\d+|第\d+'|head -1)"
  Episode="$(echo "$Episode" | sed -r "s#第#E#g")"
  Episode="$(echo "$Episode" | sed -r "s#E(P|p)#E#g")"
  Episode="$(echo "$Episode" | sed -r "s#SP#S00E#g")"
  SP="$(echo "$Episode" | egrep -c "S00")"
  name_specials="$(echo "$raw_name" | egrep -o 'Part\d+')"
  if [[ "$name_specials" != "" ]]; then
  name_specials=.$name_specials
  else
  echo "没有特殊后缀"
  fi
  if [[ $SP -eq  1 ]]
  ##SP文件处理
  then
  completed_name="$(echo "$raw_name" | sed -r "s#.*.mkv#$Episode$resolution_completed$name_specials.mkv#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.mp4#$Episode$resolution_completed$name_specials.mp4#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.iso#$Episode$resolution_completed$name_specials.iso#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.ts#$Episode$resolution_completed$name_specials.ts#g")"
  echo $completed_name
  mkdir "$(dirname "$PWD")/S00"
  mv -f "$raw_name" "$completed_name"
  mv "$completed_name" "$(dirname "$PWD")/S00"
  rm "$raw_name"
  else
  completed_name="$(echo "$raw_name" | sed -r "s#.*.mkv#$season$Episode$resolution_completed$name_specials.mkv#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.mp4#$season$Episode$resolution_completed$name_specials.mp4#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.iso#$season$Episode$resolution_completed$name_specials.iso#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.ts#$season$Episode$resolution_completed$name_specials.ts#g")"
  echo $completed_name
  mv -f "$raw_name" "$completed_name"
  rm "$raw_name"
  fi
  done
  IFS="$OLDIFS"  #还原IFS变量
  else
  echo "****开始单个命名*****"
  cd  "$folder_path"
  Episode="$(echo "$file_raw_name" | egrep -o 'E\d+|EP\d+|SP\d+|Ep\d+|第\d+'|head -1)"
  name_specials="$(echo "$file_raw_name" | egrep -o 'Part\d+')"
  if [[ "$name_specials" != "" ]]; then
  name_specials=.$name_specials
  else
  echo "没有特殊后缀"
  fi
  Episode="$(echo "$Episode" | sed -r "s#E(P|p)#E#g")"
  Episode="$(echo "$Episode" | sed -r "s#SP#S00E#g")"
  SP="$(echo "$Episode" | egrep -c "S00")"
 if [[ $SP -eq  1 ]]
  ##SP文件处理
  then
  completed_name="$(echo $file_raw_name| sed -r "s#.*.mkv#$Episode$resolution_completed$name_specials.mkv#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.mp4#$Episode$resolution_completed$name_specials.mp4#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.iso#$Episode$resolution_completed$name_specials.iso#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.ts#$Episode$resolution_completed$name_specials.ts#g")"
  echo $completed_name
  mkdir "$(dirname "$PWD")/S00"
  mv -f "$file_raw_name" "$completed_name"
  mv "$completed_name" "$(dirname "$PWD")/S00"
  rm "$file_raw_name"
  else
  completed_name="$(echo $file_raw_name| sed -r "s#.*.mkv#$season$Episode$resolution_completed$name_specials.mkv#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.mp4#$season$Episode$resolution_completed$name_specials.mp4#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.iso#$season$Episode$resolution_completed$name_specials.iso#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.ts#$season$Episode$resolution_completed$name_specials.ts#g")" 
  echo $completed_name
  mv -f "$file_raw_name" "$completed_name"
  rm "$file_raw_name"
  fi
  IFS="$OLDIFS"  #还原IFS变量
  fi 
}
###File_rename_Movie 电影文件重命名
File_rename_Movie()
{
  file_path="$1"
  folder_path="$2"
  file_raw_name="$3"
  if [ "$file_raw_name" = "" ]
  then
  echo "****开始批量重命名****"
  cd "$file_path"
  OLDIFS="$IFS"  #备份旧的IFS变量
  IFS=$'\n'   #修改分隔符为换行符
  for raw_name in `ls |egrep "mp4$|mkv$|iso|ts$"`;
  do
  echo $raw_name
  cd  "$folder_path"
  completed_name="$(echo "$raw_name" | sed -r "s#.*.mkv#$folder_name$resolution_completed.mkv#g")"
  completed_name="$(echo "$completed_name" | sed -r "s#.*.mp4#$folder_name$resolution_completed.mp4#g")"
  completed_name="$(echo "$completed_name" | sed -r "s#.*.iso#$folder_name$resolution_completed.iso#g")"
  echo $completed_name
  mv -f "$raw_name" "$completed_name"
  rm "$raw_name"
  done
  else
  echo "****开始单个命名*****"
  cd  "$folder_path"
  completed_name="$(echo $file_raw_name| sed -r "s#.*.mkv#$folder_name$resolution_completed.mkv#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.mp4#$folder_name$resolution_completed.mp4#g")"
  completed_name="$(echo $completed_name | sed -r "s#.*.iso#$folder_name$resolution_completed.iso#g")"
  echo $completed_name
  mv -f "$file_raw_name" "$completed_name"
  rm "$file_raw_name"
  fi
  IFS="$OLDIFS"  #还原IFS变量
}
####剧集合集重命名
File_rename_TV_collection()   
{
    OLDIFS="$IFS"  #备份旧的IFS变量
	collection_path=$folder_path
    cd "$torrent_path"
    for collecltion_name in `ls`;
	do
	cd "$collection_path"
	echo "文件夹名称是$collecltion_name"
	collecltion_name_completed="$(echo $collecltion_name | egrep -o 'S\d{2}')"
	mv  "$collecltion_name"  "$collecltion_name_completed"
	cd  "$collecltion_name_completed"
	rm *.nfo | rm *.jpg
	echo "$torrent_path/$collecltion_name"
	echo "$collection_path$collecltion_name_completed"
	echo "$collecltion_name_completed"
	echo "$collection_path"
	File_rename_TV "$torrent_path/$collecltion_name" "$collection_path$collecltion_name_completed" "" "$collecltion_name_completed"
	done
	IFS="$OLDIFS"  #还原IFS变量
}
###Judge判断是不是合集
Judge()
{
##通过判断下面是否有媒体文件，来判断是否是合集
if [[ $(ls "$torrent_path" | egrep -c 'mp4|mkv|ts|iso') -eq 0 ]] 
  then
    echo "是合集"
	folder_name="$name $year_completed"
	folder_name="$(echo $folder_name | sed -r 's# $##g')"
	folder_path=/$your_path/$category/$completed/$folder_name/
	mkdir  -p "$folder_path"
	hlink  "$torrent_path" "$folder_path"
	echo "[剧集名字:$name][种子hash:$torrent_hash][硬链接之后路径:$folder_path][种子名字:$torrent_name]" >> $log2
	if [[ $(echo $category | egrep -c "$your_category_tv") -eq 1 ]]; then
	if [[ $unmatch -lt 4 ]]  	##判断种子是否符合规则
	then
	echo "符合规则"
	File_rename_TV_collection
	fi
	fi
	Emby
    exit
  else
  echo "不是合集"
fi
}
#########################################主函数
###################################
#根据种子保存路径进行目录分类。
#exec > $log 2>&1
echo "test"
category="$(echo $torrent_path | egrep -o "$your_category")"
echo "目录是"$category
if [[ $(echo $Category | egrep -c "$your_Category") -eq 1 ]]
  then
  echo "Vertex推送的种子获取年份"
  year="$(echo $Category | egrep -o '\d{4}$')"
  echo "Vertex推送的种子获取名字"
  name_Vertex="$(echo $Category | sed -r "s#Vertex|第.*季|$year##g")"
  #echo "属于延迟媒体库扫描的分类"
  #nohup bash /data/diy/emby.sh "$Emby" "$Emby_Apikey" > $embylog 2>&1 &
fi

if [[ $(echo $category | egrep -c "$your_category_emby") -eq 1 ]]
then
echo "[种子hash:$torrent_hash][原路径:$torrent_path][种子名字:$torrent_name]" >> $log2
echo "属于直接媒体库扫描的目录"
Emby
fi

if [[ $(echo $category | egrep -c "$your_category") -eq 1 ]]; then
	#判断是目录还是文件
    if [ -d "$torrent_path" ];then 
	echo "目录"
	##匹配音乐视频和音乐视频ISO
	if [[ $(echo $category | egrep -c "$your_category_direct") -eq 1 ]]; then   ##直接进行硬链接的目录
	echo "直接进行硬链接的目录"
	Direct
	exit
	fi
	Folder_extract_name	##提取出相关资料和名字
	Judge  ##判断是否是合集
	if [[ $(echo $category | egrep -c "$your_category_movies") -eq 1 ]]; then     ##匹配电影
    if [[ $unmatch -lt 4 ]]  	##判断种子是否符合规则
    then
	echo "符合规则"
	folder_name="$name $year_completed"
	folder_name="$(echo $folder_name | sed -r 's# $##g')"
	folder_path=/$your_path/$category/$completed/$folder_name/
    echo "最终路径是"$folder_path
	mkdir  -p "$folder_path"
	echo "[电影名字:$name][种子hash:$torrent_hash][硬链接之后路径:$folder_path][种子名字:$torrent_name]" >> $log2
	hlink  "$torrent_path" "$folder_path"
	File_rename_Movie "$torrent_path" "$folder_path" ""
	echo "结束"
	Emby
    else
    echo "不符合规则"
    Direct		
    fi
    fi
    if [[ $(echo $category | egrep -c "$your_category_tv") -eq 1 ]]; then      	##匹配电视剧，
    if [[ $unmatch -lt 4 ]]         	##判断种子是否符合规则
    then
	echo "符合规则"
	folder_name="$name $year_completed"
	folder_name="$(echo $folder_name | sed -r 's# $##g')"
	folder_path=/$your_path/$category/$completed/$folder_name/$season
    echo "最终路径是"$folder_path
	mkdir  -p "$folder_path"
	echo "[剧集名字:$name][种子hash:$torrent_hash][硬链接之后路径:$folder_path][种子名字:$torrent_name]" >> $log2
	hlink  "$torrent_path" "$folder_path"
	File_rename_TV "$torrent_path" "$folder_path" "" "$season"
	echo "结束"
	Emby
    else
    echo "不符合规则"
    Direct		
    fi
    fi
	#单个文件转移
elif [ -f "$torrent_path" ]; then
# ${torrent_path##*/}##号截取，删除左边字符，保留右边字符，例：完整的路径是/downloads/剧集/$raw/对你的爱很美.Love.Is.Beautiful.2021.1080p.WEB-DL.H264.AAC-LeagueWEB/Love.Is.Beautiful.2021.E20.1080p.WEB-DL.H264.AAC-LeagueWEB.mp4
#截取之后变成 对你的爱很美.Love.Is.Beautiful.2021.E20.1080p.WEB-DL.H264.AAC-LeagueWEB.mp4
	echo "单文件"
	##匹配音乐和音乐视频
	if [[ $(echo $category | egrep -c "$your_category_direct") -eq 1 ]]; then      ##直接进行硬链接的目录
	  echo "直接进行硬链接的目录"
	  file_raw_name=${torrent_path##*/}
	  folder_name="$(echo $folder_name | sed -r 's#[a-zA-Z0-9]+$##g'|sed -r 's#.$##g')"
	  folder_path="/$your_path/$category/$completed/$folder_name"
	  mkdir -p "$folder_path"
	  cp -r -l   "$torrent_path" "$folder_path"/"$file_raw_name"
	  exit
	fi
    Folder_extract_name
	file_raw_name=${torrent_path##*/}
    if [[ $(echo $category | egrep -c "$your_category_movies") -eq 1 ]]; then     ##匹配电影
    if [[ $unmatch -lt 4 ]]
    then
	echo "符合规则"
	folder_name="$name $year_completed"
	folder_name="$(echo $folder_name | sed -r 's# $##g')"
	folder_path=/$your_path/$category/$completed/"$folder_name"
	echo "最终路径是"$folder_path
	mkdir  -p "$folder_path"
	echo "[电影名字:$name][种子hash:$torrent_hash][硬链接之后路径:$folder_path][种子名字:$torrent_name]" >> $log2
	cp -r -l   "$torrent_path" "$folder_path"/"$file_raw_name"
	File_rename_Movie "$folder_path" "$folder_path" "$file_raw_name"
	Emby
    else
    echo "不符合规则"
    Direct
    fi
    fi	
    if [[ $(echo $category | egrep -c "$your_category_tv") -eq 1 ]]; then      	##匹配电视剧，
    if [[ $unmatch -lt 4 ]]
    then
	echo "符合规则"
	folder_name="$name $year_completed"
	folder_name="$(echo $folder_name | sed -r 's# $##g')"
	folder_path=/$your_path/$category/$completed/"$folder_name"/$season
	echo "最终路径是"$folder_path
	mkdir  -p "$folder_path"
	echo "[剧集名字:$name][种子hash:$torrent_hash][硬链接之后路径:$folder_path][种子名字:$torrent_name]" >> $log2
	cp -r -l   "$torrent_path" "$folder_path"/"$file_raw_name"
	File_rename_TV "$folder_path" "$folder_path" "$file_raw_name" "$season"
	Emby
    else
    echo "不符合规则"
    Direct
    fi
   fi	
fi

else
     echo "不匹配" 
fi

