# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 06 — Purchase ticket API](../06-purchase-ticket-api)| [08 — Worker Lambda ▶︎](../08-worker-lambda) |


## Lesson 07 — SNS and SQS


### Goal

In this lesson we will learn how to use SNS to fire a generic event (a ticket was purchased) and how to register an SQS queue to listen for those events and store them for later processing.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#xxx)
- [xxx](#xxx)
- [xxx](#xxx)


## 07.01 - Understanding SNS and SQS

### SNS

SNS stands for Simple Notification Service and it's a service created by AWS to allow developers to easily fire notifications or dispatch messages across different system.

In [AWS's own words](https://aws.amazon.com/sns/):

> SNS is a pub/sub messaging service that makes it easy to decouple and scale microservices, distributed systems, and serverless applications

![SNS functionality diagram](https://d1.awsstatic.com/diagrams/product-page-diagrams/sns_diagram_1.7fc320874597e8c1bf3b0dd845fe89176aef0cda.png)

In SNS messages are trasnmitted through communication channel identified as *topics*. When you create a topic, different services can *publish* or *subscribe* (receive) events over it.

In our project we will use SNS to just dispatch a `TicketPurchased` event, leaving to other systems the role of picking the message up and performing other actions with it.

You can easily fire messages using SNS with the AWS SDK library, here's an example:

```javascript
const AWS = require('aws-sdk')
const sns = new AWS.SNS()

sns.publish({
  TopicArn: 'the arn of the SNS topic',
  Message: JSON.stringify({some: "arbitrary data"})
}, (err, data) => {
  if (err) {
    console.log('Ooops, it did not work', err)
  } else {
    console.log('Message published!')
  }
})
```

### SQS

SQS (Simple Queue System) is a fully managed message queuing service that makes it easy to decouple and scale microservices, distributed systems, and serverless applications.

You can use it to queue units of work can be performed asynchronously by one or more workers. Workers will periodically interrogate (*pull from*) the queue to see if there's work to do and report to the queue once some task is completed, so that no other work will try to perform it again.

In our application we will subscribe the queue to the `TicketPurchased` SNS topic, so that every SNS notification gets stored in the Queue, then (in the next lesson) we will create a worker lambda that can process it.

![Architecture diagram for SNS and SQS integraiton](architecture-diagram.png)

In this lesson we will focus on publishing a message through SNS and making sure that it gets delivered in the queue. In the next lesson we will create the worker and we will see how to pull from a queue and mark a message as consumed (*deleting* it from the queue) by using the AWS SDK.


## 07.02 - Firing an SNS message when a ticket is purchased

Create SNS topic with:

```yaml
TicketPurchasedTopic:
   Type: "AWS::SNS::Topic"
   Properties:
     TopicName: "ticketless-ticketPurchased"
     Subscription: # Add this part later
       - Endpoint: !GetAtt TicketPurchasedQueue.Arn
         Protocol: "sqs"
```

Add this to `GigsApiRole`

```yaml
- Action:
  - sns:Publish
  Effect: Allow
  Resource:
    Ref: TicketPurchasedTopic
```

In `purchaseTicket` Lambda definition add:

```yaml
Environment:
  Variables:
    SNS_TOPIC_ARN: !Ref TicketPurchasedTopic
```

... show the code changes

Install uuid (in src):

```bash
npm i --save uuid
```

in `index.js`:

(Maybe explain better the basics of using sns and then structure this as an open exercise with a template)

```javascript
// ...
const uuidv4 = require('uuid/v4')
const sns = new AWS.SNS()

// ...

// fetch gig from DynamoDB
  const queryParams = {
    Key: {
      slug: data.gig
    },
    TableName: 'gig'
  }

  docClient.get(queryParams, (err, dynamoData) => {
    if (err) {
      console.error(err)
      return callback(null, {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({error: 'Internal Server Error'})
      })
    }

    // item not found, return 404
    if (!dynamoData.Item) {
      return callback(null, {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({error: 'Invalid gig'})
      })
    }

    const gig = dynamoData.Item
    // creates a ticket object
    const ticket = {
      id: uuidv4(),
      createdAt: Date.now(),
      name: data.name,
      email: data.email,
      gig: data.gig
    }

    // fires an sns message with gig and ticket
    sns.publish({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: JSON.stringify({ticket, gig})
    }, (err, data) => {
      if (err) {
        console.error(err)
        return callback(null, {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({error: 'Internal Server Error'})
        })
      }

      // if everything went well return a 202 (accepted)
      return callback(null, {
        statusCode: 202,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({success: true})
      })
    })

//...
```

... deploy

... offer some way to test this (maybe email subscription)


## 07.03 - Connect SQS to SNS

Create SQS queue:

```yaml
TicketPurchasedQueue:
    Type: "AWS::SQS::Queue"
    Properties:
      QueueName: "ticketless-ticketPurchased"
```

Add subscription to `TicketPurchasedTopic`:

```yaml
Subscription:
  - Endpoint: !GetAtt TicketPurchasedQueue.Arn
    Protocol: "sqs"
```

Create queue policy `QueuePolicy`:

```yaml
QueuePolicy:
    Type: AWS::SQS::QueuePolicy
    Properties:
      Queues:
        - Ref: TicketPurchasedQueue
      PolicyDocument:
        Version: "2012-10-17"
        Id: "ReceiveFromSnsPolicy"
        Statement:
          - Sid: "ReceiveFromSns"
            Effect: "Allow"
            Principal: "*"
            Action:
              - sqs:SendMessage
            Resource: "*"
            Condition:
              ArnEquals:
                "aws:SourceArn": !Ref TicketPurchasedTopic
```

Deploy

Test

You should see messages accumulating in the queue

Check command line tool to fetch messages from the queue

---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 06 — Purchase ticket API](../06-purchase-ticket-api)| [08 — Worker Lambda ▶︎](../08-worker-lambda) |
