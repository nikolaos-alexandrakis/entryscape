#!/usr/bin/env bash

echo "Merging nls files"
./merge.sh

echo "Building application using require.js."
node ../libs/r.js/dist/r.js -o profile.js

echo "Optimizing CSS"
node ../libs/r.js/dist/r.js -o cssIn=../style.css out=../release/style.css