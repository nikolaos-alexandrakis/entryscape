#!/bin/bash

if ! [ -x "../merged-nls" ] ; then
   mkdir ../merged-nls
fi

if ! [ -x "../theme" ] ; then
   mkdir ../theme
fi

rm -rf ../merged-nls/*
cp -a ../libs/entryscape-commons/nls/* ../merged-nls
cp -a ../libs/entryscape-admin/nls/* ../merged-nls
cp -a ../libs/entryscape-catalog/nls/* ../merged-nls
cp -a ../libs/entryscape-terms/nls/* ../merged-nls