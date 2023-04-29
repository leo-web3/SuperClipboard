#!/bin/bash

input_filepath="./assets/icon.png"
output_iconset_name="./assets/icons"
mkdir $output_iconset_name

sips -z 16 16     $input_filepath --out "${output_iconset_name}/16x16.png"
sips -z 32 32     $input_filepath --out "${output_iconset_name}/16x16@2x.png"
sips -z 32 32     $input_filepath --out "${output_iconset_name}/32x32.png"
sips -z 64 64     $input_filepath --out "${output_iconset_name}/32x32@2x.png"
sips -z 128 128   $input_filepath --out "${output_iconset_name}/128x128.png"
sips -z 256 256   $input_filepath --out "${output_iconset_name}/128x128@2x.png"
sips -z 256 256   $input_filepath --out "${output_iconset_name}/256x256.png"
sips -z 512 512   $input_filepath --out "${output_iconset_name}/256x256@2x.png"
sips -z 512 512   $input_filepath --out "${output_iconset_name}/512x512.png"
sips -z 1024 1024   $input_filepath --out "${output_iconset_name}/512x512@2x.png"

iconutil -c icns $output_iconset_name

#rm -R $output_iconset_name
