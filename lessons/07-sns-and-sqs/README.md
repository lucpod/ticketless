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

Generic intro about the 2 technologies.

When they are useful.

How are we going to use them.

(maybe create a new section from here)

AWS code to send an SNS message

AWS code to receive and acknowledge an SQS message

...

## 07.02 - Firing an SNS message

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
