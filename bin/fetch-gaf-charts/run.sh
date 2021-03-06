#!/bin/bash

set -eu

WORKDIR=${WORKDIR:-tmp/bom-charts}
mkdir -p $WORKDIR
cd $WORKDIR

# check AWS credentials and bucket working
S3_BASE_URI=s3://${S3_BUCKET:?required}
aws s3 ls ${S3_BASE_URI}

function fetchGAF() {
  local area=$1; shift
  local codes=$@
  echo "Area $area"

  today=$(date -u "+%Y-%m-%d")
  mkdir -p aviation/gaf/${today}/$area
  pushd aviation/gaf/${today}/$area

  for code in $codes; do
    echo "Fetching ${code}"
    curl -s "http://www.bom.gov.au/fwo/aviation/${code}.xml" -O
    curl -s "http://www.bom.gov.au/fwo/aviation/${code}.png" -O
  done

  popd
}

function uploadToS3() {
  pushd aviation/gaf/
    aws s3 sync . ${S3_BASE_URI}/aviation/gaf/
  popd
}

NT=(IDY42058 IDY42059 IDY42060 IDY42061)
SA=(IDY42062 IDY42063 IDY42064 IDY42065)
VIC=(IDY42066 IDY42067 IDY42068 IDY42069)
TAS=(IDY42070 IDY42071 IDY42072 IDY42073)
WA_N=(IDY42054 IDY42055 IDY42056 IDY42057)
WA_S=(IDY42050 IDY42051 IDY42052 IDY42053)
QLD_N=(IDY42074 IDY42075 IDY42076 IDY42077)
QLD_S=(IDY42078 IDY42079 IDY42080 IDY42081)
NSW_W=(IDY42086 IDY42087 IDY42088 IDY42089)
NSW_E=(IDY42082 IDY42083 IDY42084 IDY42085)


fetchGAF "NT" "${NT[@]}"
fetchGAF "SA" "${SA[@]}"
fetchGAF "VIC" "${VIC[@]}"
fetchGAF "TAS" "${TAS[@]}"
fetchGAF "WA_N" "${WA_N[@]}"
fetchGAF "WA_S" "${WA_S[@]}"
fetchGAF "QLD_N" "${QLD_N[@]}"
fetchGAF "QLD_S" "${QLD_S[@]}"
fetchGAF "NSW_W" "${NSW_W[@]}"
fetchGAF "NSW_E" "${NSW_E[@]}"

uploadToS3

aws s3 ls ${S3_BASE_URI}/aviation/gaf/
