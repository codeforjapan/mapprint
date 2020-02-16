#!/bin/bash

echo "convert $1 into tiles"
path=$1
dir=${path%/*}
file=${path##*/}
id=${file%".kml"}
target="${id}.mbtiles"
zxy="${id}/zxy"
mkdir -p "${dir}/$zxy"
./node_modules/togeojson/togeojson "${dir}/$file" | tippecanoe  -f -o "${dir}/$target" --base-zoom=2 
tile-join --output-to-directory="${dir}/$zxy" --force --no-tile-compression --no-tile-size-limit "${dir}/$target"
