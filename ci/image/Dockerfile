FROM starkandwayne/concourse-ruby:2.5

RUN apt-get update && \
    apt-get install -y postgresql libpq-dev phantomjs && \
    curl -L https://github.com/ariya/phantomjs/releases/download/2.1.3/phantomjs -o /usr/bin/phantomjs && \
    chmod +x /usr/bin/phantomjs

ADD Gemfile Gemfile.lock /tmp/
RUN cd /tmp/ && bundle install