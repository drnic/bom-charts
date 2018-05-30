
```plain
docker build -t drnic/bom-charts-fetch-gaf-charts bin/fetch-gaf-charts
```

```plain
docker run -ti -e S3_BUCKET=bom-charts -v ~/.aws:/root/.aws -e AWS_PROFILE=starkandwayne-au drnic/bom-charts-fetch-gaf-charts /run.sh
```