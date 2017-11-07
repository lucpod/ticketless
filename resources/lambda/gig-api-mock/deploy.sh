#!/usr/bin/env bash

if [ -z "$DEPLOYMENT_BUCKET" ]; then
    echo "Need to set DEPLOYMENT_BUCKET"
    exit 1
fi

if [ -z "$STACK_NAME" ]; then
    echo "Need to set STACK_NAME"
    exit 1
fi

sam package --template-file template.yaml --s3-bucket $DEPLOYMENT_BUCKET --output-template-file packaged.yaml
sam deploy --region eu-west-1 --template-file packaged.yaml --stack-name $STACK_NAME --capabilities CAPABILITY_IAM
