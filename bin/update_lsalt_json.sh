#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

csv2json data/manual-lsalt-qld-s.csv | jq -rc 'map({"grid","lsalt-100ft"})' > public/json/lsalt-qld-s.json