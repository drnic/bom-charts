#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

gaf_areas=(NSW-E NSW-W NT QLD-N QLD-S SA TAS VIC WA-N WA-S)
for area in "${gaf_areas[@]}"; do
  csv2json data/manual-lsalt-${area}.csv | jq -rc 'map({"grid","lsalt-100ft"})' > public/json/lsalt-${area}.json
done
