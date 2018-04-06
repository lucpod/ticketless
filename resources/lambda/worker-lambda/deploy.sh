#!/usr/bin/env bash
source .env

sam package \
  --template-file template.yaml \
  --s3-bucket $DEPLOYMENT_BUCKET \
  --output-template-file packaged.yaml

sam deploy \
  --template-file packaged.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "SmtpHost=$SMTP_HOST" \
    "SmtpPort=$SMTP_PORT" \
    "SmtpSenderAddress=$SMTP_SENDER_ADDRESS" \
    "SmtpUsername=$SMTP_USERNAME" \
    "SmtpPassword=$SMTP_PASSWORD"
