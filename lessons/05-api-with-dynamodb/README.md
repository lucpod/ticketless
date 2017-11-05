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

As explored briefly in lesson 1, AWS security model is based on policies, which are JSON documents that describes permissions.

Permissions in the form of policies can be attached to a number of different things: users, resources, groups, roles. Through these abstractions, AWS gives you the flexibility to organize permission in the way that works best for you.

The topic is very broad and I encourage you to read the [official documentation](https://aws.amazon.com/documentation/iam/) about security and identity management to go in detail, but let me recap some of the main principles we need to know to progress with our app.

The main principle of security in AWS is that a user (or a compute resource) can't access any resource, unless there is a specific policy that explicitly grants them the privilege.

So the common mindset is:

> Everything is blacklisted, unless explicitly whitelisted

A **role** is defined by AWS as:

> A tool for giving temporary access to AWS resources in your AWS account.

Which basically means that it's a generic container for policies that can be used to transfer permissions to user or resources.

For example you can create a role called `BusinessAnalyst` and attach to it a number of policies that grants access to some important resources that business analysts in your company need to use.

When dealing with compute resources (EC2 instances or Lambda functions), by default they are not authorized to perform any action to any other resource, but they can be authorized to **assume** a role and inherit the permission for that role.

When deploying with SAM, by default, every Lambda gets attached a new role that uses the policy [AWSLambdaBasicExecutionRole](http://docs.aws.amazon.com/lambda/latest/dg/intro-permission-model.html#lambda-intro-execution-role).

`AWSLambdaBasicExecutionRole` guarantees to the Lambda only the minimum set of privileges needed to write logs to Cloudwatch. If you try to access any other resource, you Lambda execution will simply fail with a permission error.

So, what if we want to guarantee our Lambda a specific privilege, for example reading from a DynamoDB table or writing to an S3 bucket?

As you might have guessed we will need to create a new role with the needed permissions and allow the Lambda to assume that role.

In the next section we will see how to do that with SAM.


## 05.02 - Creating a role to access our DynamoDB table

...


## 05.02 - Using the AWS SDK

...


## 05.03 - Update our lambdas

...


## Validate


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 04 — Serverless Application Model](../04-serverless-application-model)| [06 — ... ▶︎](../) |
