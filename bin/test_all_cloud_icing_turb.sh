#!/bin/bash

gafAreaCodes=( WA-N WA-S NT QLD-N QLD-S SA NSW-W NSW-E VIC TAS )
SERVER_URL=${SERVER_URL:-http://localhost:3000}

for areaCode in "${gafAreaCodes[@]}"; do
  for period in current next; do
    echo "Area ${areaCode}/Period ${period}:"
    result=$(curl -s ${SERVER_URL}/api/gafarea/${areaCode}/current.json | jq -rc '.areas[]["wx-cond"][]["cloud-ice-turb"]')
    if [[ $(echo "$result" | jq -r ".[].parsed // \"ERROR\"") == "ERROR" ]]; then
      echo "ERROR: Failed to parse: ${result}"
    elif [[ "${SHOW_ALL:-X}" != "X" ]]; then
      echo "${result}" | jq -rc .
    fi
  done
done