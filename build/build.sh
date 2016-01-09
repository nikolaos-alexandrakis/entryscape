#!/usr/bin/env bash

echo "Merging nls files"
./merge.sh

echo "Building application using require.js."
node ../libs/r.js/dist/r.js -o profile.js