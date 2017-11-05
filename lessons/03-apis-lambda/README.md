# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 02 — Setting up DynamoDB](../02-setting-up-dynamodb) | [04 — Serverless Application Model ▶︎](../04-serverless-application-model) |


## Lesson 03 — REST APIs with Lambda and API Gateway


### Goal

In this lesson we will learn key concepts in Lambda Functions and API Gateway, two services that can allow you to build and deploy scalable REST APIs in a quick and efficient fashion.

If you are already familiar with those concepts you can use skip to the next lesson.


### Contents

- [AWS Lambda basics](#0301---aws-lambda-basics)
- [First Lambda in Node.js](#0302---first-lambda-in-nodejs)
- [API Gateway basics](#0303---api-gateway-basics)
- [Handling Errors in Lambda-proxy integration](#0304---handling-errors-in-lambda-proxy-integration)


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

This service allows you to create endpoints and map them to different integration points like another HTTP endpoint, another AWS service, a Lambda function or a mock endpoint.

For the sake of this tutorial, we will use Lambda function as API Gateway integration endpoint.

In this case, API Gateway offers a convention-based integration mode called [lambda-proxy integration](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html#api-gateway-proxy-integration-lambda-function-nodejs).

This mode, basically provides a way to map a generic HTTP request to the JSON event that gets passed to the lambda function and expects from the lambda function a response that represents an HTTP response in a pre-defined format.


### Lambda-proxy integration input format

The event received in your Lambda as result of an API call will look like the following, as defined in  [Input Format of a Lambda Function for Proxy Integration](http://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format):

```
{
  "resource": "Resource path",
  "path": "Path parameter",
  "httpMethod": "Incoming request's method name"
  "headers": {Incoming request headers}
  "queryStringParameters": {query string parameters }
  "pathParameters":  {path parameters}
  "stageVariables": {Applicable stage variables}
  "requestContext": {Request context, including authorizer-returned key-value pairs}
  "body": "A JSON string of the request payload."
  "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
}
```

Most of the time the attributes you will use from the `event` inside your lambda are:

  - `headers`: a dictionary object that allows you to read the list of headers sent in the HTTP request
  - `queryStringParameters`: a dictionary object that allows you to read the list of query string parameters sent in the HTTP request
  - `pathParameters`: in API gateway you can define arbitrary path parameters (we will see that shortly), if you do so, you will find the value for every parameter as a dictionary here.
  - `body`: the raw body sent for example in POST requests

Just to understand this better, let's make an example. Let's assume we have the following API specification to update or create a specific gig:

```
Endpoint: /gig/:slug ("slug" is a path parameter)
Method: POST
```

If we issue the following request:

```bash
curl \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"band":"U2","location":"london"}' \
  https://abcdefgh.execute-api.eu-west-1.amazonaws.com/Prod/gig/u2-london?update=true
```

This data will be available in the Lambda event:

```json
{
  "headers": {
    "Content-Type": "application/json"
  },
  "method": "POST",
  "path": "/gig/u2-london",
  "pathParameters": {
    "slug": "u2-london"
  },
  "queryStringParameters": {
    "update": "true"
  },
  "body": "{\"band\":\"U2\",\"location\":\"london\"}"
}
```

So based on this abstraction you can get all the needed details from the current HTTP request
and provide a generate a response through your Lambda.


## Lambda-proxy integration output format

Similarly to what we just saw for the input format, there is also a convention for the [Output Format of a Lambda Function for Proxy Integration](http://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format):

```
{
  "isBase64Encoded": true|false,
  "statusCode": httpStatusCode,
  "headers": { "headerName": "headerValue", ... },
  "body": "..."
}
```

This means that when we pass a response object to the `callback` function in our Lambda,
the object should have the following keys:

  - `statusCode`: the HTTP status code (e.g. 200, 404, ...)
  - `headers`: a dictionary of response headers (e.g. `{"Access-Control-Allow-Origin": "*"}` for CORS)
  - `body`: the raw body of the response (most of the time this is a JSON encoded string)


### A smarter Hello World Lambda ready for API gateway

To familiarize more with these input and output abstractions, let's re-build a simple Hello World lambda
suitable for API Gateway Lambda proxy integration that takes a `name` as query string parameter and returns a JSON body that contains `{"message": "Hello ${name}"}`.

```javascript
#index.js
exports.handler = (event, context, callback) => {
  // extract the query string parameter from the event (if not available, defaults to 'World')
  const name = event.queryStringParameters && event.queryStringParameters.name
    ? event.queryStringParameters.name
    : 'World'

  // prepare the response body as a JSON string
  const body = JSON.stringify({
    message: `Hello ${name}`
  })

  // create the full response object
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  }

  // return the response and ultimate the lambda execution
  return callback(null, response)
}
```

Let's now create 2 test events (`with-name.json` and `without-name.json`), so that we can test this lambda using `lambda-local`:

```bash
tee with-name.json <<'JSON'
{
  "queryStringParameters": {
    "name": "Alan Turing"
  }
}
JSON

tee without-name.json <<'JSON'
{}
JSON
```

Now let's test the first case:

```bash
lambda-local -l index.js -h handler -e with-name.json
```

Which should produce the following output:

```
info: Logs
info: ------
info: START RequestId: e3e7283b-314a-498f-7efa-4ee5ffa14ed1
info: END
info: Message
info: ------
info: {
	"statusCode": 200,
	"headers": {
		"Content-Type": "application/json"
	},
	"body": "{\"message\":\"Hello Alan Turing\"}"
}
info: -----
info: lambda-local successfully complete.
```

And then the second case:

```bash
lambda-local -l index.js -h handler -e without-name.json
```

Which produces:

```
info: Logs
info: ------
info: START RequestId: 814ae71f-912d-a3cb-4933-137a85f3f192
info: END
info: Message
info: ------
info: {
	"statusCode": 200,
	"headers": {
		"Content-Type": "application/json"
	},
	"body": "{\"message\":\"Hello World\"}"
}
info: -----
info: lambda-local successfully complete.
```

> 💡 **TIP**: With this approach we are not really testing our local code against a real HTTP request,
but just manually simulating what's happening at the Lambda layer. We will see later on that there are tools
that will allow us to test also the API Gateway integration locally.


## 03.04 - Handling Errors in Lambda-proxy integration

If you want to stop the execution of a Lambda with an error you have to invoke the callback by passing the error object as first parameter:

```javascript
exports.handler = (event, context, callback) => {
  return callback(new Error('This execution failed'))
}
```

When running this Lambda in AWS, it will immediately terminate with an error. The error will then be logged (in Cloudwatch) and the Lambda execution marked as failed.

In case the Lambda was triggered by an API Gateway request event, in such case, API Gateway doesn't have a response object and doesn't really know how to report the error to the client, so it simply defaults to a `502 Bad Gateway` HTTP error and you have no way to provide a detailed error report to the client.

The preferred way to report meaningful HTTP errors to client is to invoke the callback without error object and build a normal Lambda Proxy integration response objects (as saw previously) with the proper HTTP status code and all the error details in the body.

For example in case we want to respond with a 404 we can use the following code:

```javascript
// ...
return callback(null, {
  statusCode: 404,
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"error":"Content Not Found"}'
})
```

Same goes for server side errors (5xx):

```javascript
// ...
return callback(null, {
  statusCode: 599,
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"error":"Connection to external data source timed out"}'
})
```

When creating a production-ready™ Lambda for an API it's also a good practice to wrap the content of the Lambda in a `try` `catch` block in order to be able to manage unexpected errors and report them correctly as a 500 error to the invoking client:

```javascript
exports.handler = (event, context, callback) => {
  try {
    // Business logic here...
  } catch (err) {
    // make sure the error is logged
    console.error(err)
    // return a proper 500 response to the client
    return callback(null, {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{"error":"Internal Server Error"}'
    })
  }
}
```

> 💡 **TIP**: When using this approach, your lambda executions are never marked as failed (in the web AWS Lambda dashboard) so, if you want reports regarding specific HTTP errors happening in your code (generally 5xx errors), you will have to extract those information from the logs.


## Verify

This lesson was just a playground to get confident with AWS Lambda and API Gateway. We didn't add any new piece to our project.
In the next lesson we will use the concept learned here to start to implement the APIs that will power our application.


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 02 — Setting up DynamoDB](../02-setting-up-dynamodb) | [04 — Serverless Application Model ▶︎](../04-serverless-application-model) |
