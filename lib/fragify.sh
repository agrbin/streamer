#!/bin/bash
input=$1

function usage {
  echo "usage: $0 mp3_file"
  exit 1
}

[  $# -ne 1 ] && usage

if [ -r $input ]; then

  set -e
  out_dir=$(dirname $0)/frags
  mkdir -p $out_dir
  rm -f $out_dir/*.mp3

  # strip out id3
  mpgcat $input 2> /dev/null 1> $out_dir/input.mp3

  # encode to what chrome likes
  lame --quiet -t --resample 48 --nores --cbr -b 96 \
    $out_dir/input.mp3 $out_dir/tg.mp3

  # chunkify
  (cd $out_dir && ./../frames)
  rm -f $out_dir/tg.mp3 $out_dir/input.mp3

else
  usage
fi
