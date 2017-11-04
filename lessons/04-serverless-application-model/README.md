# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 03 — REST APIs with Lambda and API Gateway](../03-apis-lambda)| [04 — ... ▶︎](../04...) |


## Lesson 04 — Serverless Application Model


### Goal

In this lesson we will learn how to develop, test and deploy Serverless applications by using the Serverless Application Model (SAM) specification. We will use these concepts to build the first iteration of our API that will be able to list all the available gigs and a specific gig, selected by ID (slug).

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#xxx)
- [xxx](#xxx)
- [xxx](#xxx)


## 04.01 - Introduction to SAM

Creating, testing and deploying Lambda Functions often requires you to be able to bind several moving parts together (e.g. Lambda code and configuration, API Gateway configuration, DynamoDB, S3, Policies, etc.), so trying to manage every part manually from the command line might result in being a slow, boring and error prone operation.

To overcome those issues, AWS created SAM, short for [Serverless Application Model](https://github.com/awslabs/serverless-application-model).

AWS SAM is a model used to define serverless applications on AWS and it is based on [AWS CloudFormation](https://aws.amazon.com/cloudformation/).

A serverless application is defined in a [CloudFormation template](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/gettingstarted.templatebasics.html) and deployed as a [CloudFormation stack](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/updating.stacks.walkthrough.html). An AWS SAM template is a CloudFormation template.

AWS SAM defines a set of objects which can be included in a CloudFormation template to describe common components of serverless applications easily.


## 04.02 - SAM template for our application

Before starting to explore SAM let's explore the expected file structure of our SAM project:

```
.
├── src
│   └── index.js
└── template.yaml
```

In our project folder we have 2 files:

  - `src/index.js`: the file containing the code for our Lambda functions
  - `template.yaml`: a YAML file that describes the configuration of our serverless application following the SAM specification.

Our goal is to create two APIs, one to retrieve the full list of available gigs and one to select a single gig by slug.

The two APIs will have respectively the following endpoints:

```
GET /gigs
GET /gigs/{slug}
```

Where `{slug}` is an arbitrary path parameter identifying the slug of a gig (e.g. `u2-bratislava`).

Let's see the content of our `template.yaml` file:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: 'AWS::Serverless-2016-10-31'
Description: A Mock API to return all gigs or a single gig

Resources:

  listGigs:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./src
      Handler: index.listGigs
      Runtime: nodejs6.10
      Events:
        Endpoint:
          Type: Api
          Properties:
            Path: /gigs
            Method: get

  gig:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./src
      Handler: index.gig
      Runtime: nodejs6.10
      Events:
        Endpoint:
          Type: Api
          Properties:
            Path: /gigs/{slug}
            Method: get
```

Let's analyze the content of this file:

  - The first 2 attributes (`AWSTemplateFormatVersion` and `Transform`) are necessary to tell Cloudformation that this file uses the SAM format.

  - `Description` allows you to specify an arbitratry description for the Cloudformation stack that will be deployed with this template.

  - `Resources` is the most important part of the template and allows us to specify all the different resources that we want to use in our application (in this case 2 lambda functions).

  - A Lamdba function in SAM is identified by the `Type` `AWS::Serverless::Function` and a set of `Properties`.

  - The property `CodeUri` is used to specify where the code for the lambda is stored, while `Handler` is used to indicate which file and function needs to be loaded by to run the Lambda. This parameter uses the format `fileName.functionName`. For example when we specify `index.listGigs`, the Lambda runtime will load the file `index.js` in our code path and from this file import the function `listGigs`.

  - `Runtime` indicates which runtime we want to use to run the code (in our case Node.js version 6.10)

  - `Events` is a dictionary that describes all the events that will trigger the execution of the Lambda function. Every event is identified by an arbitrary name (in our case we choose `Endpoint`). An event object needs to have a `Type` (in the case of API Gateway it's simply `Api`) and a set of `Properties`. Properties will change based on the type of event, for Api events we specified a `Path` and a `Method`.

That's it for now, but if you are curious to know more about the capabilities and the syntax of the SAM specification, be sure to [check out the official documentation](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md).


## 04.03 - Gigs API with mock data

We can now work on our `src/index.js` file and write the Node.js code for our Lambda functions.

The file will have the following structure:

```javascript
exports.listGigs = (event, context, callback) => {
  // ...
  // 1. get the list of gigs
  // 2. invoke the callback to return an http lambda proxy response
  //    with the list of gigs.
  //    The body of the response is a JSON object that contains
  //    a property `gigs` which is the array of all the available gigs
}

exports.gig = (event, context, callback) => {
  // ...
  // 1. get the list of gigs
  // 2. search the gig with the slug coming from `event.pathParameters.slug`
  // 3. if no gig is found return a 404
  // 4. if the gig is found return it as body of a lambda proxy response.
}
```

In this phase we don't want to use the data in DynamoDB, but a simple mock data that you can generate with the following code:

```javascript
const mockGigs = [ ...Array(12).keys() ].map(i => ({
  slug: `band${i}-location${i}`,
  bandName: `Mock Band ${i}`,
  city: `Mock City ${i}`,
  year: '1961',
  date: '2019-01-01',
  venue: `Mock Venue ${i}`,
  collectionPointMap: 'map-placeholder.png',
  collectionPoint: 'New York, NY 10001, USA',
  collectionTime: '14:30',
  originalDate: '1977-02-05',
  capacity: 3000,
  description: `Mock description ${i}`,
  image: 'band-placeholder.png',
  price: '1010'
}))
```

This code fills the array `mockGigs` with a list of 12 gigs, using the structure that is expected in our frontend app and also in our DynamoDB database.

Try to fill the blanks in the sample implementation above and write the code that implements all the steps. If you get stuck, or you prefer to be guided through it, you can see a solution in [`resources/lambda/gig-api-mock`](/resources/lambda/gig-api-mock/src/index.js).

> 💡 **TIP**: Since the frontend will invoke these APIs from a different documentation, the APIs response need to have the header:
>
> ```plain
> Access-Control-Allow-Origin: *
> ```

When you think you are ready to test your implementation you can run a local version of the code by using [SAM-local](https://github.com/awslabs/aws-sam-local) (in the folder where you placed the `template.yaml` file):

```bash
sam local start-api
```

This command will spin up some local docker containers that simulates API Gateway and the Lambda Runtime and expose the APIs over the base path `http://127.0.0.1:3000`.
So at this point you can use any REST client of your choice (or even a browser) to play with your implementation.

> 💡 **TIP**: When using SAM, SAM-local is a better alternative to lambda-local for local testing. In fact, SAM-local will simulate more accurately what happens in the real AWS environment, taking into account the correct version of the runtime and many of the [limits](http://docs.aws.amazon.com/lambda/latest/dg/limits.html) that you might face in your production environment.

If you did everything correctly this should be the expected output:

`http://127.0.0.1:3000/gigs/`

[![/gigs request expected result](expected-api-output1-thumb.png)](expected-api-output1.png)

`http://127.0.0.1:3000/gigs/`

[![/gigs/band1-location1 request expected result](expected-api-output2-thumb.png)](expected-api-output2.png)


## 04.04 - Packaging and deploying the API

**TODO**

  - package through SAM
  - deploy through SAM
  - get the APIs URL
  - Invoke the APIs through client


## 04.05 - Update the frontend app to reference the new APIs

**TODO**

  - describe how to update the reference in S3


## Verify

**TODO**

  - describe how to visit the website and see if everything works as expected



**TODO**

  - Tip that mention serverless, apex or other alternative frameworks

  ---

  | Previous lesson  | Next lesson      |
  | :--------------- | ---------------: |
  | [◀︎ 03 — REST APIs with Lambda and API Gateway](../03-apis-lambda) | [04 — ... ▶︎](../04...) |
