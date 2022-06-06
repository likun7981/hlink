#!/bin/bash

Emby="$1"
Emby_Apikey="$2"

set -x 
   curl -X POST "http://$Emby/emby/Library/Refresh?api_key=$Emby_Apikey" -H "accept: */*" -d ""
   date
   sleep 180
   date
   curl -X POST "http://$Emby/emby/Library/Refresh?api_key=$Emby_Apikey" -H "accept: */*" -d ""
   echo "启动媒体库扫描"
set +x

exit
