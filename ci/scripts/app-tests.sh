#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../..

set -eu

bin/check_envvars

cat > /etc/postgresql/*/main/pg_hba.conf <<-EOF
local   all   postgres   trust
EOF
service postgresql restart

cat > config/database.yml <<-YAML
default: &default
  adapter: postgresql
  encoding: unicode
  pool: 5
  username: postgres
  template: template0

development:
  <<: *default
  database: collective-training-app_development

test:
  <<: *default
  database: collective-training-app_test

production:
  <<: *default
  database: collective-training-app_production
YAML

set -x

bundle
bundle exec rails db:create:all
bundle exec rails db:migrate
bundle exec rails test
bundle exec rails test:system
