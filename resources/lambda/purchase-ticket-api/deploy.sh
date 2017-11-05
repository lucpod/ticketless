#!/usr/bin/env bash
export DEPLOYMENT_BUCKET=ticketless-lambda-deployment-abcdefg
export STACK_NAME=ticketless
sam package --template-file template.yaml --s3-bucket $DEPLOYMENT_BUCKET --output-template-file packaged.yaml
sam deploy --region eu-west-1 --template-file packaged.yaml --stack-name $STACK_NAME --capabilities CAPABILITY_IAM
