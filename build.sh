#!/bin/sh

# 安装包
echo 安装依赖的npm包
# npm install
# 编译
echo 开始编译...

npm run build

echo 打包...
cd dist
node ../tool/zip

echo 生成文件名...
# fileName="./src/config.js"
# fileContent=$(cat "$fileName")
# temp=${fileContent#*VERSION:\"}
# verNumber=${temp%%\"*}_$(date +"%Y%m%d%H%M")

verNumber=$(date +"%Y%m%d%H%M")

mv dist.zip ../task_${verNumber}.zip

# 删除 dist
echo 删除 dist
cd ..
rm -rf dist
