#!/bin/bash

set -eu

git clone app app-with-assets
cd app-with-assets

yarn
export PATH=$PWD/node_modules/.bin:$PATH

pushd public/gaf
  webpack --mode production
popd

pushd public/gaf2
  webpack --mode development
popd
