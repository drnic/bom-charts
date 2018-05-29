#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

csv2json data/manual-lsalt-QLD-S.csv | jq -rc 'map({"grid","lsalt-100ft"})' > public/json/lsalt-QLD-S.json
csv2json data/manual-lsalt-NSW-E.csv | jq -rc 'map({"grid","lsalt-100ft"})' > public/json/lsalt-NSW-E.json
csv2json data/manual-lsalt-TAS.csv | jq -rc 'map({"grid","lsalt-100ft"})' > public/json/lsalt-TAS.json