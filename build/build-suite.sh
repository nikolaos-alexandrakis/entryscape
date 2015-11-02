#!/usr/bin/env bash

echo "Building EntryScape application using require.js."
../node_modules/requirejs/bin/r.js -o profile.js mainConfigFile=../config/suiteConfig.js include=entryscape-suite/config/suiteConfig dir=../release/suite/
