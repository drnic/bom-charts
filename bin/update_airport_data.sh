#!/bin/bash

set -eu

if [[ "$(which csv2json)X" == "X" ]]; then
  npm -g i converter-csvtojson-cli
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

# curl https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat -o data/openflights-airports.csv

# https://openflights.org/data.html#airport
cat > data/openflights-airports-au.csv <<HEADER
"Airport ID",Name,City,Country,IATA,ICAO,Latitude,Longitude,Altitude,Timezone,DST,"Tz database time zone",Type,Source
HEADER

grep Australia data/openflights-airports.csv >> data/openflights-airports-au.csv

mkdir -p public/json
csv2json data/openflights-airports-au.csv | jq -rc 'map({ICAO, Latitude, Longitude, Name})' > public/json/openflights-airports-au.json
