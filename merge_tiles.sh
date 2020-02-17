#!/bin/bash
file=$1
base=`basename $file .json`
target_dir=$2
dir=$target_dir$base
echo "----------------------"
echo "convert raw tile to ${dir}/${zxy}"
tile-join --output-to-directory="${dir}/$zxy" --force --no-tile-compression --no-tile-size-limit $dir/*.mbtiles
