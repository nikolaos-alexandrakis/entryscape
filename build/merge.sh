#!/bin/bash

rm -rf ../merged-nls/*
cp -a ../libs/entryscape-commons/nls/* ../merged-nls
cp -a ../libs/entryscape-admin/nls/* ../merged-nls
cp -a ../libs/entryscape-catalog/nls/* ../merged-nls
cp -a ../libs/entryscape-terms/nls/* ../merged-nls