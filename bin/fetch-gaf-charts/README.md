
```plain
docker build -t drnic/bom-charts-fetch-gaf-charts bin/fetch-gaf-charts
```

```plain
docker run -ti -e S3_BUCKET=bom-charts -v ~/.aws:/root/.aws -e AWS_PROFILE=starkandwayne-au drnic/bom-charts-fetch-gaf-charts /run.sh
```

Deploying to CF from this folder:

```plain
CF_DOCKER_PASSWORD=... cf push bom-charts-fetch-charts --var AWS_ACCESS_KEY_ID=... --var AWS_SECRET_ACCESS_KEY=...
```

Once the app stages and runs the first time, stop it:

```plain
cf stop bom-charts-fetch-charts
```

Follow the instructions at https://starkandwayne.com/blog/schedule-containers-in-pivotal-cloud-foundry/ to setup scheduling.

I think the following should run the job each day at 1am:

```plain
cf schedule-job fetch-charts "0 1 ? * *"
```