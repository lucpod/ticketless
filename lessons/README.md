# Ticketless — getting started with Serverless and Lambda functions


## Table of Contents

 1. [Deploying the frontend](01-deploying-frontend)
 2. [Setting up DynamoDB](02-setting-up-dynamodb)
 3. [REST APIs with Lambda and API Gateway](03-apis-lambda)
 4. [Serverless Application Model](04-serverless-application-model)
 5. [Integrating API with DynamoDB](05-api-with-dynamodb)
 6. [Purchase ticket API](06-purchase-ticket-api)
 7. [SNS and SQS](07-sns-and-sqs)
 8. [Worker Lambda](08-worker-lambda)


## Requirements

Before getting started, make sure you have the following requirements:

 - Your own [AWS account](https://aws.amazon.com/free)
 - An AWS user with Admin access and Programmatic Access ([See how to create one](/lessons/extra/CREATE_AWS_USER.md))
 - [AWS Command Line Interface](https://aws.amazon.com/cli) installed and configured
 - [Node.js](https://nodejs.org) (v6.10 or higher)
 - A [bash](https://www.gnu.org/software/bash) compatible shell
 - [Docker](https://www.docker.com/)
 - [SAM / SAM Local](https://github.com/awslabs/aws-sam-local)

> ⭐️ If you are lazy (which is good) or you don't want to install all this stuff in your laptop just for a workshop, you can use our [**amazing helper container**](https://github.com/lucpod/serverless-workshop-helper-container) that already contains all of these!

When you fulfilled all the requirements, **create a folder called `workshop`** (or anything you want, really 😜) somewhere in your machine.

In the rest of this workshop you'll be running commands and editing files in this directory.

> ⭐️ If you decided to use the [**amazing helper container**](https://github.com/lucpod/serverless-workshop-helper-container) you have to initialize it with the following commands (from within your workshop folder):
> ```bash
> curl -O https://raw.githubusercontent.com/lucpod/serverless-workshop-helper-container/master/docker-compose.yml
> curl -o .env https://raw.githubusercontent.com/lucpod/serverless-workshop-helper-container/master/.env~SAMPLE
> # Edit the .env file and add your AWS credentials settings
>
> docker pull lucpod/workshop:latest
> docker-compose up -d
> docker-compose exec workshop bash
>
> # You'll be running all the commands from this terminal!
> ```

Now you are ready to go! 👍

**Get started with [Lesson 1 ▶︎](/lessons/01-deploying-frontend)**
