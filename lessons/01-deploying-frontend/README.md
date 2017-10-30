# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| ◀︎               | [02 — Setting up DynamoDB ▶︎](../02-setting-up-dynamodb) |

## Lesson 01 — Deploying the frontend


### Goal

In this lesson we will learn how to host a static website using S3 and Cloudfront.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add cloudformation template


### 01.01 - Create a bucket

Amazon Simple Storage Service (S3) is storage for the Internet. It is designed to make web-scale computing easier for developers.

Amazon S3 has a simple web services interface that you can use to store and retrieve any amount of data, at any time, from anywhere on the web. It gives any developer access to the same highly scalable, reliable, fast, inexpensive data storage infrastructure that Amazon uses to run its own global network of web sites. The service aims to maximize benefits of scale and to pass those benefits on to developers. (read more on the [official S3 documentation](http://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html)).

--

In order to store files in S3 you have to create a **bucket** in one of the regions available. In this tutorial we are going to use by default `eu-west-1` as preferred region, but feel free to change this parameter if you wish to use another region.

A bucket is a like a top-level folder in S3 and, by default, it is owned by the AWS account that creates it.

An S3 bucket needs to have a globally unique name (across regions and accounts).

An S3 bucket can be named by following the same conventions of DNS names, which means you can use lowercase letters, numbers, hyphens and dots (more details [here](http://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html)).

To create a bucket in your account you can run the following command:

```bash
BUCKET_NAME=ticketless-frontend-$(head /dev/urandom | env LC_CTYPE=C tr -cd 'a-z0-9' | head -c 6)
aws s3 mb s3://$BUCKET_NAME --region eu-west-1
```

**TIP**: `mb` stands for **Make Bucket**

This will output something like:

```
make_bucket: ticketless-frontend-2j3suc
```

To verify that the bucket is there you can now run:

```bash
aws s3 ls --region eu-west-1
```


### 01 - Verify

...
