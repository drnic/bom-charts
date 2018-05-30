FROM alpine:3.7
RUN apk -v --update add \
        python3 \
        curl \
        bash \
        && \
    pip3 install --upgrade pip && \
    pip3 install --upgrade awscli s3cmd && \
    rm /var/cache/apk/*
VOLUME /root/.aws

ADD run.sh /run.sh

ENTRYPOINT [ "/run.sh" ]