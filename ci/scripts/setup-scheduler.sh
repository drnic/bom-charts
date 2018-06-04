#!/bin/bash

set -eu

cf api ${CF_API}
cf auth "${CF_USERNAME}" "${CF_PASSWORD}"
cf target -o "${CF_ORG}" -s "${CF_SPACE}"

cf install-plugin -f app/vendor/cli-plugins/scheduler-for-pcf-cliplugin-linux64*

set -x
cf create-job ${APP_NAME:-happy-harvest-bot} update-from-harvest "bin/rails update_from_harvest"
cf schedule-job update-from-harvest "*/30 * ? * * "

cf run-job update-from-harvest
