# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 04 — Serverless Application Model](../04-serverless-application-model)| [06 — ... ▶︎](../) |


## Lesson 05 — Integrating API with DynamoDB


### Goal

In this lesson we will learn how to use the Node.js AWS SDK inside a Lambda and, more specifically, how to query DynamoDB with it.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#xxx)
- [xxx](#xxx)
- [xxx](#xxx)


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


## 05.02 - Using the AWS SDK

...


## 05.03 - Update our lambdas

...


## Validate


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 04 — Serverless Application Model](../04-serverless-application-model)| [06 — ... ▶︎](../) |
