#!/bin/bash

# Shows the text + parsed result for all Cloud/Icing/Turb currently:
# Area TAS/Period next:
# {"text":"SCT ST 1500/2500FT LAND (BKN A2)","parsed":{"cloud":{"amount":"SCT","type":"ST","base":1500,"top":2500}}}
# {"text":"SCT CU/SC 2500/5000FT (BKN BASE 2000FT A1)","parsed":{"cloud":{"amount":"SCT","type":"CU/SC","base":2500,"top":5000}}}
# {"text":"FEW ST 1500/2500FT, BECMG SCT FM 14Z","parsed":{"cloud":{"amount":"FEW","type":"ST","base":1500,"top":2500}}}
# {"text":"FEW CU/SC 3000/5000FT, BECMG SCT FM 14Z","parsed":{"cloud":{"amount":"FEW","type":"CU/SC","base":3000,"top":5000}}}

gafAreaCodes=( WA-N WA-S NT QLD-N QLD-S SA NSW-W NSW-E VIC TAS )
SERVER_URL=${SERVER_URL:-http://localhost:3000}

for areaCode in "${gafAreaCodes[@]}"; do
  for period in current next; do
    echo "Area ${areaCode}/${period}:"
    result=$(curl -s ${SERVER_URL}/api/gafarea/${areaCode}/current.json | jq -rc '.areas[]["wx-cond"][]["cloud-ice-turb"]')

    echo "$result" | jq -rc ".[] | {text, parsed}"
  done
done