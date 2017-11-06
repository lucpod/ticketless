# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 07 — SNS and SQS](../07-sns-and-sqs)| [Extra ▶︎](../extra) |


## Lesson 08 — Worker Lambda


### Goal

In this lesson we will learn how to consume messages from an SQS queue, how to write Lambda function that run on a schedule and finally, how to inject external parameters during deploy (e.g. API tokens or other secrets).

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#xxx)
- [xxx](#xxx)
- [xxx](#xxx)


## 08.01 - Consuming messages from an SQS queue

You can consume a message from an SQS queue in a Lambda function by using the AWS
SDK.

The idea is that you start by pulling the queue for one or more messages, then you process the received payload,
finally when the processing is done, you remove the message(s) from the queue to mark the job as
completed.

SQS, in fact, by default will put messages back in the queue if they are not deleted by the worker.
This happens because the worker might crash before completing the processing of the message and the
queue tries to protect you from losing messages.

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

So in order to get the real content of the message you will need to JSON-parse-it™
twice as follows:


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

Mention SES, complex setup, needed a domain.

For the sake of this exercise we are going to use [mailtrap](https://mailtrap.io) and the node [nodemailer](http://npm.im/nodemailer) module

Show how to get parameters in mailtrap:

  - Host:	smtp.mailtrap.io
  - Port:	25 or 465 or 2525 (use 465)
  - Username:	xxx
  - Password:	yyy

We need to have a way to provide the above ones plus some extra parameters

  - sender email address (`SmtpSenderAddress`)

explain SAM parameters

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

# ...
```

Briefly explain how you can pass values for these parameters on deploy:

For convenience you can create an `.env` file where you put your values:

```bash
# .env
export SMTP_HOST="smtp.mailtrap.io"
export SMTP_PORT="465"
export SMTP_SENDER_ADDRESS="staff@ticketless.com"
export SMTP_USERNAME="xxx"
export SMTP_PASSWORD="yyy"
```

Use the `.env~sample` file as reference.

Remember to ignore this file in case you are committing this to git.

Now before every deploy you can

```bash
source .env
```

Command to deploy

```bash
sam deploy \
  --region eu-west-1 \
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

TIP: You can create a more refined deploy script that loads the env before running the commands


## 08.03 - Create worker lambda

We need to define the role (so that the lambda can read from the queue and delete messages)

In template.yaml

```yaml
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
```

Add Lambda definition:

```yaml
SendMailWorker:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./src
      Handler: index.sendMailWorker
      Runtime: nodejs6.10
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
```

explain the schedule event


## 08.04 - Creating the lambda

First of all install new dependencies.

From `src`:

```bash
npm i --save nodemailer nodemailer-smtp-transport
```

Update `index.js`:

```javascript
//...

const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

// ...

const sqs = new AWS.SQS()

// ...

exports.sendMailWorker = (event, context, callback) => {
  const receiveMessageParams = {
    QueueUrl: process.env.SQS_QUEUE_URL,
    MaxNumberOfMessages: 1
  }

  sqs.receiveMessage(receiveMessageParams, (err, data) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    if (!data.Messages) {
      console.log('no messages to process')
      return callback(null, 'no messages to process')
    }

    const message = data.Messages[0]

    // extract message data from sqs message
    // the double JSON parse is because the sqs message contains the original sns message
    // in the body, so we are basically extracting the data from the `Message` attribute
    // of the original sns message.
    const messageData = JSON.parse(JSON.parse(message.Body).Message)

    const transporter = nodemailer.createTransport(smtpTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    }))

    const subject = `Your ticket for ${messageData.gig.bandName} in ${messageData.gig.city}`

    const content = `
Hey ${messageData.ticket.name},
you are going to see ${messageData.gig.bandName} in ${messageData.gig.city}!

This is the secret code that will give you access to our time travel collection point:

---
${messageData.ticket.id}
---

Be sure to show it to our staff at entrance.

Collection point is placed in ${messageData.gig.collectionPoint}.
Be sure to be there on ${messageData.gig.date} at ${messageData.gig.collectionTime}

We already look forward (or maybe backward) to having you there, it's going to be epic!

— Your friendly Ticketless staff

PS: remember that is forbidden to place bets or do any other action that might substantially
increase your net worth while time travelling. Travel safe!
`

    const mailOptions = {
      from: process.env.SMTP_SENDER_ADDRESS,
      to: messageData.ticket.email,
      subject,
      text: content
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err)
        return callback(err)
      }

      // delete message from queue
      const deleteMessageParams = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle
      }

      sqs.deleteMessage(deleteMessageParams, (err, data) => {
        if (err) {
          console.error(err)
          return callback(err)
        }

        console.log('1 message processed successfully')
        return callback(null, 'Completed')
      })
    })

// ...

```

TODO: reformat as template and structure as exercise where to fill in the gaps

Deploy

Test

Closing off

...


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 07 — SNS and SQS](../07-sns-and-sqs)| [Extra ▶︎](../extra) |
