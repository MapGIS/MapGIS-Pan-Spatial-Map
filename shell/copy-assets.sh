#!/bin/bash

SOURCE="./node_modules/@mapgis/webclient-cesium-plugin/dist/webclient-cesium-plugin-resource"
DEST="./public/webclient-cesium-plugin-resource"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows (Git Bash, Cygwin, Msys)
  robocopy "$SOURCE" "$DEST" /E /IS
else
  # macOS/Linux
  cp -r "$SOURCE/" "$DEST/"
fi

echo "✅ 复制资源完成"