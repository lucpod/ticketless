# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 07 — SNS and SQS](../07-sns-and-sqs)| [Extra ▶︎](../extra) |


## Lesson 08 — Worker Lambda


### Goal

In this lesson we will learn how to consume messages from an SQS queue, how to write Lambda function that run on a schedule and finally, how to inject external parameters during deploy (e.g. API tokens or other secrets).


### Contents

  - [Consuming messages from an SQS queue](#0801---consuming-messages-from-an-sqs-queue)
  - [Sending emails from Node.js / Lambda](#0802---sending-emails-from-nodejs--lambda)
  - [Managing configuration in Lambda](#0803---managing-configuration-in-lambda)
  - [Defining the worker Lambda](#0804---defining-the-worker-lambda)
  - [Writing the worker code](#0805---writing-the-worker-code)


## 08.01 - Consuming messages from an SQS queue

You can consume a message from an SQS queue in a Lambda function by using the AWS SDK.

The idea is that you start by pulling the queue for one or more messages, then you process the received payload,
finally when the processing is done, you remove the message(s) from the queue to mark the job as completed.

SQS, in fact, by default will put messages back in the queue if they are not deleted by the worker.
This happens because the worker might crash before completing the processing of the message and the queue system tries to protect you from losing messages.

Using the AWS SDK, you can pull for a message as follows:

```javascript
const AWS = require('aws-sdk')
const sqs = new AWS.SQS()

const receiveMessageParams = {
  QueueUrl: '<QueueURL>',
  MaxNumberOfMessages: 1
}

sqs.receiveMessage(receiveMessageParams, (err, data) => {
  if (err) {
    console.error(err)
  } else {
    if (data.Messages) {
      // some message was received
      console.log(data.Messages)
    } else {
      console.log('No message available')
    }
  }
})
```

If messages are fetched, `data.Messages` will be an array of messages.

Since our messages are originally coming from SNS, the structure of data received from
SQS will look like the following:

```json
{
  "Messages": [
    {
      "Body": "{\n  \"Type\" : \"Notification\",\n  \"MessageId\" : \"abcdef01-2345-6789-0abc-defg123456783\",\n  \"TopicArn\" : \"arn:aws:sns:eu-west-1:123456789012:ticketless-ticketPurchased\",\n  \"Message\" : \"{\\\"ticket\\\":{\\\"id\\\":\\\"abcdef01-2345-6789-0abc-defg123456784\\\",\\\"createdAt\\\":1509980177897,\\\"name\\\":\\\"Alex Smith\\\",\\\"email\\\":\\\"email@example.com\\\",\\\"gig\\\":\\\"nirvana-cork-1991\\\"},\\\"gig\\\":{\\\"capacity\\\":2300,\\\"collectionPoint\\\":\\\"29 South Main Street, Centre, Cork City, Co. Cork, Ireland\\\",\\\"collectionTime\\\":\\\"13:00\\\",\\\"slug\\\":\\\"nirvana-cork-1991\\\",\\\"originalDate\\\":\\\"1991-08-20\\\",\\\"venue\\\":\\\"Cavern Club\\\",\\\"bandName\\\":\\\"Nirvana\\\",\\\"city\\\":\\\"Cork\\\",\\\"date\\\":\\\"2019-06-21\\\",\\\"image\\\":\\\"nirvana.jpg\\\",\\\"year\\\":\\\"1991\\\",\\\"collectionPointMap\\\":\\\"map-nirvana-cork-1991.png\\\",\\\"description\\\":\\\"Lorem Ipsum\\\",\\\"price\\\":\\\"1666.60\\\"}}\",\n  \"Timestamp\" : \"2017-11-06T14:56:18.123Z\",\n  \"SignatureVersion\" : \"1\",\n  \"Signature\" : \"someRandomLongString\",\n  \"SigningCertURL\" : \"https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-12345678.pem\",\n  \"UnsubscribeURL\" : \"https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:123456789012:ticketless-ticketPurchased:abcdef01-2345-6789-0abc-defg123456785\"\n}",
      "ReceiptHandle": "someRandomLongString",
      "MD5OfBody": "abcdef1234567890abcdef1234567890",
      "MessageId": "abcdef01-2345-6789-0abc-defg12345678"
    }
  ]
}
```
([View this JSON in the browser](https://gist.githubusercontent.com/lmammino/ae072002e64b1e1e8372aac9b0158ea4/raw/85ffc54239e1134e4395955269311160cc01660d/example.json))

So in order to get the real content of the message you will need to JSON-parse-it™ twice as follows:


```javascript
const fistMessage = data.Messages[0]
const firstMessageContent = JSON.parse(JSON.parse(fistMessage.Body).Message)
```

In order to acknowledge SQS that a message was processed and delete it from the queue,
you can use the AWS SDK as follows:

```javascript
const AWS = require('aws-sdk')
const sqs = new AWS.SQS()

const deleteMessageParams = {
  QueueUrl: '<QueueURL>',
  ReceiptHandle: '<ReceiptHandle>' // Every message has a `ReceiptHandle` property
}

sqs.deleteMessage(deleteMessageParams, (err, data) => {
  if (err) {
    console.error(err)
  }

  console.log('message deleted successfully')
})
```


## 08.02 - Sending emails from Node.js / Lambda

As part of this lesson we will need to send an email from a Lambda function.

AWS offers a complete service for sending transactional emails called
[Simple Email Service (SES)](https://aws.amazon.com/ses/).

Although this is the right service to use in production for sending emails in the AWS cloud, it takes sometime to be configured and you will need a custom domain registered.

Also, for the sake of this tutorial, we don't really need to send real email to real people, so a simple SMTP test server is more than enough for our purposes.

A very good (and mostly free) cloud based SMTP test server is [Mailtrap](https://mailtrap.io).

You can quickly create a free account on Mailtrap using you GitHub profile and, then,
from your online panel be sure to copy somewhere the following parameters as we will need them
later:

  - `Host`:	smtp.mailtrap.io
  - `Port`:	25 or 465 or 2525 (use 465)
  - `Username`:	xxx
  - `Password`:	yyy

In order to send emails from Node.js we can use the [nodemailer](http://npm.im/nodemailer) module
in combination with the [nodemailer-smtp-transport](http://npm.im/nodemailer-smtp-transport) companion module, so be sure to install them in your `src` folder:

```bash
npm i --save nodemailer nodemailer-smtp-transport
```

Here's a quick 'n dirty example on how to send a quick email with `nodemailer` using
SMTP:

```javascript
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

const transporter = nodemailer.createTransport(smtpTransport({
  host: 'somehost.com',
  port: 465,
  auth: {
    user: 'arthur',
    pass: 'conan doyle'
  }
}))

const mailOptions = {
  from: 'some@one.com',
  to: 'somebody@else.com',
  subject: 'Just catching up...',
  text: 'Hey buddy, how are you today?'
}

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Mail sent successfully!')
  }
})
```


## 08.03 - Managing configuration in Lambda

It should be pretty much obvious at this point that we need a way to manage configuration parameters
coming from the outside.

Ideally we don't want to embed these parameters directly in our `template.yaml`, but
have some facility to inject them from the outside at deploy time, maybe from local environment variables.

Turns out that in SAM (and in Cloudformation), there is a concept of "generic parameters".

That's how we can add all the parameters we need for this lesson in our `template.yaml`:


```yaml
# ...
Parameters:
  SmtpHost:
    Description: The SMTP Host to send emails
    Type: String
  SmtpPort:
    Description: The port for the SMTP server (generally 25 or 465)
    Type: Number
    Default: 465
  SmtpSenderAddress:
    Description: "The email address to send emails from"
    Type: String
  SmtpUsername:
    Description: "The username to authenticate to the SMTP server"
    Type: String
  SmtpPassword:
    Description: "The password to authenticate to the SMTP server"
    Type: String

Resources:
# ...
```

From now on, every time we deploy we have to specify values for these parameters, which is a bit annoying.

A strategy I often use in those cases is to create a file called `.env` (which I immediately add to my `.gitignore` to make sure I don't commit it by mistake! 😅) that contains the values for all the variables:

```bash
# .env
export DEPLOYMENT_BUCKET=ticketless-lambda-deployment-abcdefg
export STACK_NAME=ticketless
export SMTP_HOST="smtp.mailtrap.io"
export SMTP_PORT="465"
export SMTP_SENDER_ADDRESS="staff@ticketless.com"
export SMTP_USERNAME="xxx"
export SMTP_PASSWORD="yyy"
```

> 💡 **TIP**: If you do this, be sure to replace the `DEPLOYMENT_BUCKET`, `SMTP_USERNAME` and `SMTP_PASSWORD` with your actual value.

> ⚠️ **CAUTION**: This new `.env` file is not the same you might be already using if you are using the [helper container](https://github.com/lucpod/serverless-workshop-helper-container). In order to differentiate between them, I would suggest you to store this new one inside the `lambda` folder.

Now when you start your development session you can run:

```bash
source .env
```

This will load all the sensitive values as environment variables in your current session.

So now, for the entire duration of your shell session you can use the following command to deploy:

```bash
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
```

> 💡 **TIP**: You can update your deploy script (if you created one previously) to include these changes.

> 💡 **TIP**: In real production apps it can be a good idea to store these parameters
in AWS by using dedicated services like [Systems Manager Parameter Store](http://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) or [Config](https://aws.amazon.com/config) or even the new [Secret Manager](https://aws.amazon.com/blogs/aws/aws-secrets-manager-store-distribute-and-rotate-credentials-securely/). With most of these services you can also store these values as encrypted strings and fine tune the level of access to different users or systems.


## 08.04 - Defining the worker Lambda

We are now almost ready to write the code for our worker lambda.

The first thing we need is a dedicated role that allows the lambda to access messages
from our queue and delete them.

Let's add the role definition in the `template.yaml` under the `Resources` section:

```yaml
# ...

Resources:

  # ...

  SendMailWorkerRole:
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
                  - "sqs:ReceiveMessage"
                  - "sqs:DeleteMessage"
                Resource: !GetAtt TicketPurchasedQueue.Arn

  # ...
```

And finally, we have to define our Lambda function in the `template.yaml` as well:

```yaml
# ...

Resources:

  # ...

  SendMailWorker:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./src
      Handler: index.sendMailWorker
      Runtime: nodejs8.10
      Role: !GetAtt SendMailWorkerRole.Arn
      Environment:
        Variables:
          SQS_QUEUE_URL: !Ref TicketPurchasedQueue
          SMTP_HOST: !Ref SmtpHost
          SMTP_PORT: !Ref SmtpPort
          SMTP_SENDER_ADDRESS: !Ref SmtpSenderAddress
          SMTP_USERNAME: !Ref SmtpUsername
          SMTP_PASSWORD: !Ref SmtpPassword
      Events:
        Timer:
          Type: Schedule
          Properties:
            Schedule: rate(1 minute)
  # ...
```

The new things to notice here is how we are defining environment variables by referencing the SAM parameters we defined in the previous section (using the `!Ref` operator).

With this approach all the parameters values will be available in the Lambda code as environment variables.

For example you can access the SMTP password with:

```javascript
process.env.SMTP_PASSWORD
```

Another new thing here is the `Schedule` event. The schedule event allows us to execute a Lambda at periodic intervals (in this case every minute).

The syntax is very simple in this case, for more elaborate schedule rules you can even use
[cron expressions](http://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html).


## 08.05 - Writing the worker code

So, here it goes with the fun part: let's write some Lambda code to implement our worker.

Before doing that remember to add `nodemailer` and `nodemailer-smtp-transport` as
dependencies.

To understand the logic that should happen in this new Lambda you can use the
following template:

```javascript
//...

const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

// ...

const sqs = new AWS.SQS()

// ...

exports.sendMailWorker = (event, context, callback) => {
  // - 1. Try to read a message from the queue
  // - 2. If there are no messages stop the execution
  // - 3. If there is a message retrieve the current ticket and the current gig from
  //      the message body
  // - 4. Use the ticket and the gig to create an email message to the ticket owner
  // - 5. Send the email
  // - 6. If the email send fails exit with an error
  // - 7. If the email send succeeds delete the SQS message from the queue and exit
  //      with success
})
```

If you feel lost or if you need some inspiration you can consult my implementation
in [`resources/lambda/worker-lambda`](/resources/lambda/worker-lambda/src/index.js).

When you feel comfortable enough with the code you can deploy (this time make sure you have all the environment variables in your shell session):

```bash
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
```


## Verify

If you did everything correctly, every time you purchase a new ticket, after one or more
minutes you should see an email appearing in your *Mailtrap* account.

> ⚠️ **CAUTION**: Polling SQS every minute is not for free. If you keep this running for few hours you will still be inside the free tier period, but if you leave it running forever you might start to reach a paid level. So be sure to disable the schedule for the worker lambda (or to remove the lambda entirely) when you are finished with this tutorial 🙄


## Closing off

That's the end of our tutorial! Well done for making it to the end! 🙀

If you need more insights or ideas to keep exploring the serverless world, there's
a surprise! Check out the next section: [Extras](../extra)!


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 07 — SNS and SQS](../07-sns-and-sqs)| [Extra ▶︎](../extra) |
