#!/bin/bash
echo "----------------------"
echo "convert $1 into tiles"
path=$1
dir=${path%/*}
file=${path##*/}
id=${file%".kml"}
target="${id}.mbtiles"
zxy="${id}/zxy"
mkdir -p "${dir}/$zxy"
npx togeojson "${dir}/$file" | tippecanoe  -f -o "${dir}/$target" --base-zoom=2 -l mapprint
