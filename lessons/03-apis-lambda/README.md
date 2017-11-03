# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 02 — Setting up DynamoDB](../02-setting-up-dynamodb) | [04 — ... ▶︎](../04...) |


## Lesson 03 — REST APIs with Lambda and API Gateway


### Goal

In this lesson we will learn key concepts in Lambda Functions and API Gateway, two services that can allow you to build and deploy scalable REST APIs in a quick and efficient fashion.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#0301---xxx)
- [yyy](#0301---yyy)


## 03.01 - AWS Lambda basics

AWS Lambda is the core of *serverless compute* in the AWS cloud. The Lambda service allows you to write code (in the form of *functions*) that will be automatically executed by the runtime when specific events happen in your environment.

These are some of the typical use cases of Lambda:

  - Respond to an HTTP request (through API Gateway)
  - Process new files uploaded in an S3 bucket
  - Process new items created (or changed) in a DynamoDB table
  - Execute some job at a scheduled time (through Cloudwatch schedules)

In this lesson we will focus on the first use case, but if you are curious about all the Lambda capabilities and benefits you can learn more on the [official documentation page](https://aws.amazon.com/documentation/lambda/).


## 03.02 - First Lambda in Node.js

A valid Node.js Lambda function needs to have a predefined signature:

```javascript
function (event, context, callback) {
  // business logic here
}
```

The three important details here are `event`, `context` and `callback`.

A Lambda Function is generally triggered by external events such as an API call or a cron job. You can bind a Lambda to one or more events so that every time the event happens it will trigger the execution of the Lambda code.

  - The `event` parameter will be populated with an object that describes the type of the event and provides all the relevant details (for example, what API was called and with which parameters).
  - `context` will contain some details regarding the execution context (for example how long this function has been running), we generally don't need to worry much about it unless we want to enable some advanced behaviours.
  - `callback` is the function that the handler needs to invoke when its job is finished or when there's an error and we need to stop the execution. Lambda functions are considered to be asynchronous functions and the callback is a common pattern in asynchronous JavaScript code to indicate the asynchronous task finished.

A typical Hello World Lambda will look like this:

```javascript
// index.js
exports.handler = (event, context, callback) => {
  callback(null, 'Hello World')
}
```

If you want to test this lambda locally, the easiest way to do it is by installing [lambda-local](https://www.npmjs.com/package/lambda-local) and then running:

```bash
echo "{}" > sample-event.json
lambda-local -l index.js -h handler -e sample-event.json
```

Which will execute the handler code in your locally installed node version by using an empty object as event.

If everything went fine you should see some output similar to the following:

```
info: START RequestId: fdf52d5d-401c-29ce-880b-4559aa6325e8
info: End - Message
info: ------
info: Hello World
info: ------
info: Lambda successfully executed in 4ms.
```


## 03.03 - API Gateway basics

Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale.

This service allows to create endpoints and map them to different integration points like another HTTP endpoint, another AWS service, a Lambda function or a mock endpoint.

**TODO**

  - describe lambda-proxy integration mode
  - describe lambda-proxy input format
  - describe lambda-proxy output format
  - change hello world lambda to use input parameter as name and respond with proper output format
  - test the api with lambda local


## 03.04 - Gigs API with mock data

**TODO**

  - Use mock file to create the two gigs api (list all and list single)
  - add CORS headers
  - show how to test the apis with lamba-local


## 03.05 - Introduction to SAM

**TODO**

  - brief introduction to SAM
  - write SAM file for our new apis
  - deploy through SAM
  - get the APIs URL
  - Invoke the APIs through client


## 03.06 - Update the frontend app to reference the new APIs

**TODO**

  - describe how to update the reference in S3

## Verify

**TODO**

  - describe how to visit the website and see if everything works as expected

---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 02 — Setting up DynamoDB](../02-setting-up-dynamodb) | [04 — ... ▶︎](../04...) |
