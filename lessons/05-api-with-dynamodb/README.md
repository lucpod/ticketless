# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 04 — Serverless Application Model](../04-serverless-application-model)| [06 — Purchase ticket API ▶︎](../06-purchase-ticket-api) |


## Lesson 05 — Integrating API with DynamoDB


### Goal

In this lesson we will learn how to use the Node.js AWS SDK inside a Lambda and, more specifically, how to query DynamoDB with it.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [Understanding Policies and Roles in AWS](#0501---understanding-policies-and-roles-in-aws)
- [Creating a role to access our DynamoDB table](#0502---creating-a-role-to-access-our-dynamodb-table)
- [Accessing DynamoDB with the AWS SDK](#0503---accessing-dynamodb-with-the-aws-sdk)
- [Using DynamoDB in oru APIs](#0504---using-dynamodb-in-oru-apis)


## 05.01 - Understanding Policies and Roles in AWS

As explored briefly in [lesson 1](../01-deploying-frontend#0104---bucket-policy), AWS security model is based on policies, which are JSON documents that describe permissions.

Permissions in the form of policies can be attached to a number of different things: *users*, *resources*, *groups*, *roles*. Through these abstractions, AWS gives you the flexibility to organize permission in the way that works best for you and your organization.

The topic is very broad and I encourage you to read the [official documentation](https://aws.amazon.com/documentation/iam/) about security and identity management to go in detail, but let me recap here some of the main principles we need to know to make progress with our project.

The main principle of security in AWS is that a user (or a compute resource) can't access any resource, unless there is a specific policy that explicitly grants them the privilege.

So the common mindset is:

> Everything is blacklisted, unless explicitly whitelisted

A **role** is defined by AWS as:

> A tool for giving temporary access to AWS resources in your AWS account.

Which basically means that it's a generic container for policies that can be used to transfer permissions to user or resources.

For example, you can create a role called `BusinessAnalyst` and attach to it a number of policies that grants access to some important resources that business analysts in your company need to use.

When dealing with compute resources (like EC2 instances or Lambda functions), by default they are not authorized to perform any action to any other resource, but they can be authorized to **assume** a role and inherit the permissions defined for that role.

When deploying with SAM, by default, every Lambda gets attached a new role that uses the policy [AWSLambdaBasicExecutionRole](http://docs.aws.amazon.com/lambda/latest/dg/intro-permission-model.html#lambda-intro-execution-role).

`AWSLambdaBasicExecutionRole` guarantees to the Lambda only the minimum set of privileges needed to write logs to Cloudwatch. If you try to access any other resource, you Lambda execution will simply fail with a permission error.

So, what if we want to guarantee our Lambda a specific privilege, for example reading from a DynamoDB table or writing to an S3 bucket?

As you might have guessed we will need to create a new role with the needed permissions and allow the Lambda to assume that role.

In the next section we will see how to do that with SAM.


## 05.02 - Creating a role to access our DynamoDB table

We want to update our API Lambda functions to read the data from our `gig` database table. So we need to create a role that allows the Lambda to perform basic read actions on our DynamoDB table.

In SAM we can define roles in the `Resources` section.

Let's see how a new role called `GigsApiRole` can be defined in our `template.yaml`:

```yaml

# ...

Resources:

  # ...

  GigsApiRole:
    Type: "AWS::IAM::Role"
    Properties:
      ManagedPolicyArns:
        - "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: "AllowLambdaServiceToAssumeRole"
            Effect: "Allow"
            Action:
              - "sts:AssumeRole"
            Principal:
              Service:
                - "lambda.amazonaws.com"
      Policies:
        - PolicyName: "GigsApiDynamoDBPolicy"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: "Allow"
                Action:
                  - "dynamodb:Scan"
                  - "dynamodb:GetItem"
                Resource: !Sub 'arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/gig'

  # ...
```

The first thing to notice is that a role resource has type `AWS::IAM::Role` and 3 main properties: `ManagedPolicyArns`, `AssumeRolePolicyDocument` and `Policies`.

  - `ManagedPolicyArns` allows the new role to inherit already existing policies in your AWS account. We use this capability to inherit the permissions from the `AWSLambdaBasicExecutionRole`. This way Lambda functions with this role will retain the capability to write logs to Cloudwatch.
  - `AssumeRolePolicyDocument` describes a specific policy that is needed for allowing the Lambda to assume a role and inherit its permissions.
  - `Policies` is an array of policy directly created and attached to the role (inline policies). We use this option to create a policy that guarantees the capability to perform `Scan` and `GetItem` operation on our DynamoDB `gig` table. So at this stage we are basically guaranteeing read only access to the given DynamoDB table.

This change in our SAM template will make so that the next time we deploy the packaged template the role `GigsApiRole` will be created. But this is not enough to give permissions to our Lamba functions, because we still have to *attach* the new role to our functions.

To attach the `GigsApiRole` to our `listGigs` and `gig` functions we have to add **in both functions** a new property: `Role` which references to the new role:

```yaml
Role: !GetAtt GigsApiRole.Arn
```

If you want to be sure you updated the template file correctly, you can compare it with the one present in this repository in [`resources/lambda/gig-api-dynamodb/`](/resources/lambda/gig-api-dynamodb/template.yaml).

At this point, if you did everything correctly, you should be able to re-package and re-deploy your project:

```bash
sam package --template-file template.yaml --s3-bucket $DEPLOYMENT_BUCKET --output-template-file packaged.yaml
sam deploy --region eu-west-1 --template-file packaged.yaml --stack-name $STACK_NAME --capabilities CAPABILITY_IAM
```

The code is not changed, so the API still returns mock data, but now the underlying Lambda functions have the permission to read from our DynamoDB table.

In the next section we will see how to take advantage of this new capability.


## 05.03 - Accessing DynamoDB with the AWS SDK

In every Lambda function we can use the AWS SDK to interact with other AWS resources by simply requiring the library:

```javascript
const AWS = require('aws-sdk')
```

This library is pre-installed in every Lambda, so we don't need to create a `package.json` or run `npm` in order to use it. We will see in the following lessons how to use arbitrary dependencies from NPM.

Once we imported the AWS SDK we can get a DynamoDB instance with:

```javascript
const docClient = new AWS.DynamoDB.DocumentClient()
```

DynamoDB has a variety of features and you can access them directly from the [`AWS.DynamoDB`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property) object or from [`AWS.DynamoDB.DocumentClient`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html). We will focus only on the [`scan`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property) and [`get`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property) operations of the `DocumentClient`, so if you want to know more, please reference to the [official DynamoDB API reference](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html).


### Scan operation

We can invoke `docClient.scan` to get one or more items and all their attributes.

Here is an example that allows us to get all the items in a table:

```javascript
const queryParams = {
  TableName : 'Table'
}

const docClient = new AWS.DynamoDB.DocumentClient()

docClient.scan(queryParams, (err, data) => {
  if (err) {
    console.error(err)
    throw err
  }

  // prints all the items
  console.log(data.Items)
})
```

> 💡 **TIP**: scan can also use filtering to fetch items matching specific conditions. Check out the [documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property) if you are curious to learn how to do it.


### Get operation

We can invoke `docClient.get` to get a specific item by key and fetch all the item attributes.

Here is an example that allows us to get an item by key from a given table:

```javascript
const queryParams = {
  Key: {
    thePrimaryKey: 'primaryKeyValue'
  },
  TableName: 'someTable'
}

const docClient = new AWS.DynamoDB.DocumentClient()

docClient.get(queryParams, (err, data) => {
  if (err) {
    console.error(err)
    throw err
  }

  if (!data.Item) {
    // item not found
    // ...
  } else {
    // prints the item
    console.log(data.Item)
  }
})
```


## 05.04 - Using DynamoDB in oru APIs

Now we should have acquired the needed knowledge to update our Lambda functions and make use of DynamoDB to fetch the data.

In order to update the `index.js` file you can use the following template:

```javascript
// 1. import AWS SDK
// 2. instantiate a document client

exports.listGigs = (event, context, callback) => {
  // 3. use the document client to perform a scan operation
  //    on the gig table
  //    
  //    - if the scan fail, log the error and return a 500 response
  //    - if the scan succeed return all the gigs in object with the key `gigs`
  //      and a 200 response
}

exports.gig = (event, context, callback) => {
  // 4. use the document client to get a single item from the gig
  //    table by slug
  //    
  //    - if the get fails, log the error and return a 500 response
  //    - if the scan succeed but without results return a 404 response
  //    - otherwise return the gig object with a 200 response
}
```

If you are not sure about your code or need some more guidance you can have a look at the complete example in [`resources/lambda/gig-api-dynamodb`](/resources/lambda/gig-api-dynamodb/src/index.js).

Once you are confident enough about your update API you can run a new deploy:

```bash
sam package --template-file template.yaml --s3-bucket $DEPLOYMENT_BUCKET --output-template-file packaged.yaml
sam deploy --region eu-west-1 --template-file packaged.yaml --stack-name $STACK_NAME --capabilities CAPABILITY_IAM
```


## Validate

If you followed all the steps correctly, you should now be able to refresh your frontend and see some real data!

---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 04 — Serverless Application Model](../04-serverless-application-model)|  [06 — Purchase ticket API ▶︎](../06-purchase-ticket-api) |
