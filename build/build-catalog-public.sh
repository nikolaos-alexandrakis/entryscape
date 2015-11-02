#!/usr/bin/env bash

echo "Building EntryScape-Catalog public application using require.js."
../node_modules/requirejs/bin/r.js -o profile.js mainConfigFile=../config/publicCatalogConfig.js include=iis-datahotell/config/publicConfig dir=../release/publicCatalog/
