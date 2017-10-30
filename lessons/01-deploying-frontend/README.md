# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| ◀︎               | [02 — Setting up DynamoDB ▶︎](../02-setting-up-dynamodb) |

## Lesson 01 — Deploying the frontend


### Goal

In this lesson we will learn how to host a static website using S3 and Cloudfront.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add cloudformation template


## 01.01 - Create a bucket

Amazon Simple Storage Service (S3) is storage for the Internet. It is designed to make web-scale computing easier for developers.

Amazon S3 has a simple web services interface that you can use to store and retrieve any amount of data, at any time, from anywhere on the web. It gives any developer access to the same highly scalable, reliable, fast, inexpensive data storage infrastructure that Amazon uses to run its own global network of web sites. The service aims to maximize benefits of scale and to pass those benefits on to developers. (read more on the [official S3 documentation](http://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html)).

In order to store files in S3 you have to create a **bucket** in one of the regions available. In this tutorial we are going to use by default `eu-west-1` as preferred region, but feel free to change this parameter if you wish to use another region.

A bucket is a like a top-level folder in S3 and, by default, it is owned by the AWS account that creates it.

An S3 bucket needs to have a globally unique name (across regions and accounts).

An S3 bucket can be named by following the same conventions of DNS names, which means you can use lowercase letters, numbers, hyphens and dots (more details [here](http://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html)).

To create a bucket in your account you can run the following command:

```bash
export BUCKET_NAME=ticketless-frontend-$(head /dev/urandom | env LC_CTYPE=C tr -cd 'a-z0-9' | head -c 6)
aws s3 mb s3://$BUCKET_NAME --region eu-west-1
```

> **TIP**: `mb` stands for **Make Bucket**

> **TIP**: with the first command we create a random name for the bucket using a sequence of shell commands. Of course if you prefer you can leave out the randomisation and pick a unique name yourself like: `ticketless-frontend-for-unicorns`

This will output something like:

```
make_bucket: ticketless-frontend-2j3suc
```

To verify that the bucket is there you can now run:

```bash
aws s3 ls --region eu-west-1
```

This command will list all the buckets created in your account in the specified region.


## 01.02 - Copy the frontend files in the bucket

In the previous step we successfully created a bucket for our frontend, but... the bucket is still empty!

To see the files in a bucket you can run this command:

```bash
aws s3 ls s3://$BUCKET_NAME
```

as expected, this won't produce any output, which means there are currently no files in the bucket.

All the files we need for the frontend of our app are available under [`resources/frontend`](../../resources/frontend), so if you have this repository clones somewhere in your machine you can run this command (from the root folder of this repo):

```bash
aws s3 cp resources/frontend s3://$BUCKET_NAME --recursive --exclude 'node_modules/*'
```

> **TIP**: the `--exclude` option will make sure that we won't copy files that are not needed for the frontend to work (in this case the `node_modules` folder which is used only for development dependencies).

If you want to make sure the files are there, you can run again the command:

```
aws s3 ls s3://$BUCKET_NAME
```

This time you should see the following output:

```
                           PRE css/
                           PRE images/
                           PRE js/
2017-10-30 16:32:40      15086 favicon.ico
2017-10-30 16:32:40       3039 index.html
2017-10-30 16:32:41      44877 package-lock.json
2017-10-30 16:32:41        282 package.json
```

If you want to list the files inside the `images` *prefix* (subfolder), you can do so by running:

```bash
aws s3 ls s3://$BUCKET_NAME/images/
```

> **TIP**: another way to copy files into an S3 bucket is to use the [sync](http://docs.aws.amazon.com/cli/latest/reference/s3/sync.html) command.


## 01.03 - Expose the bucket as a website

Files in an S3 bucket can be easily exposed as a website. To do so you have to enable the website option in your bucket with the following command:

```bash
aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document index.html
```

Where:

- `--index-document` represents the document to be used as default index
- `--error-document` represents the document to be used as 404 page (not found)

> **TIP**: we use `index.html` in both cases because our frontend is a single page application and it's internal routing will manage error messages in case the internal route is not found.

This command will not produce any output.

The website will be accessible in a URL that follows this convention:

```
http://<BUCKET_NAME>.s3-website-<REGION>.amazonaws.com
```

Where `BUCKET_NAME` is the name of your bucket and `REGION` the region where it is hosted.

For example this might be your URL

```
http://ticketless-frontend-xxxyyy.s3-website-eu-west-1.amazonaws.com
```

Be sure to replace the parameters correctly and visit the URL.

At this point you should see an error saying: **403 Forbidden**, this is because, the files in our bucket are still private and we need to make them publicly readable in order to allow everybody on the internet to read them.


## 01.04 - Provide bucket policy

...

## 01 - Verify

...
