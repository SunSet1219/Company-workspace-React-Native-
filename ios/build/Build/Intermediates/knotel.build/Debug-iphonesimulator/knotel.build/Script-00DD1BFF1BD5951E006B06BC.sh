#!/bin/sh
export NODE_BINARY=node
../node_modules/react-native/packager/react-native-xcode.sh
./Fabric.framework/run 78bf5c82937758a95198b2e87f393e217600f36a 7885aa19d2814b9ac505580b2e7b46007c9b145f98d077c037772ffcee861c22
