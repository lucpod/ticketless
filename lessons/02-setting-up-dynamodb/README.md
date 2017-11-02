# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 01 — Deploying the frontend](../01-deploying-frontend) | [03 — ... ▶︎](../03...) |


## Lesson 02 — Setting up DynamoDB


### Goal

In this lesson we will learn key concepts in dynamoDB, how to use Dynamo DB, how to create a table and how to load it with data from a file.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [DynamoDB basics](#0201---dynamodb-basics)
- [Create a table](#0202---create-a-table)
- [Load data into dynamodb](#0203---load-data-into-dynamodb)
- [Verify by reading data from DynamoDB](#0204---verify-by-reading-data-from-dynamodb)


## 02.01 - DynamoDB basics

Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. DynamoDB lets you offload the administrative burdens of operating and scaling a distributed database, so that you don't have to worry about hardware provisioning, setup and configuration, replication, software patching, or cluster scaling.

The following are the basic DynamoDB components:

- **Tables** – Similar to other database systems, DynamoDB stores data in tables. A table is a collection of data.
- **Items** – Each table contains multiple items. An item is a group of attributes that is uniquely identifiable among all of the other items. Items in DynamoDB are similar in many ways to rows, records, or tuples in other database systems. In DynamoDB, there is no limit to the number of items you can store in a table.
- **Attributes** – Each item is composed of one or more attributes. An attribute is a fundamental data element, something that does not need to be broken down any further.

When you create a table, in addition to the table name, you must specify the primary key of the table. The primary key uniquely identifies each item in the table, so that no two items can have the same key.

DynamoDB supports two different kinds of primary keys:

- **Partition key** – A simple primary key, composed of one attribute known as the partition key.
DynamoDB uses the partition key's value as input to an internal hash function. The output from the hash function determines the partition (physical storage internal to DynamoDB) in which the item will be stored.
In a table that has only a partition key, no two items can have the same partition key value.

- **Partition key and sort key** – Referred to as a composite primary key, this type of key is composed of two attributes. The first attribute is the partition key, and the second attribute is the sort key.
DynamoDB uses the partition key value as input to an internal hash function. The output from the hash function determines the partition (physical storage internal to DynamoDB) in which the item will be stored. All items with the same partition key are stored together, in sorted order by sort key value.
In a table that has a partition key and a sort key, it's possible for two items to have the same partition key value. However, those two items must have different sort key values.


## 02.02 - Create a table

For our application, we need to store a number of gigs with a set of specific attributes.

The following table describes the attributes we want to use all over our application regarding gigs:

| Field name | Type | Description |
| ---------- | ---- | ----------- |
| `slug` | string | Primary ID for a gig |
| `bandName` | string | The name of the performing band |
| `city` | string | The city where the original performance is held |
| `year` | string | The year (format `YYYY`) of the original performance |
| `date` | string | The date (format `YYYY-MM-DD`) when the time travel is happening |
| `venue` | string | The venue hosting the original performance |
| `collectionPointMap` | string | The filename of the collection point map |
| `collectionPoint` | string | The address of the place where to go for the time travel |
| `collectionTime` | string | The time (format `HH:mm`) when the time travel happens |
| `originalDate` | String | The date (format `YYYY-MM-DD`) when the original performance happened |
| `capacity` | Integer | The number of tickets available |
| `description` | String | The description of the band |
| `price` | string | The price (in USD) |

It's a good practice to have a well-defined data structure in mind, but, in reality, When defining a table in DynamoDB you only need to define the the partition key (and optionally the sort key if you need one).

DynamoDB is by design a schema-less database, which means that the data items in a table need not have the same attributes or even the same number of attributes.

In order to create the `gig` table (where we are going to store all the available gigs in our application), we can run the following command:

```bash
aws dynamodb create-table \
  --region eu-west-1 \
  --table-name gig \
  --attribute-definitions AttributeName=slug,AttributeType=S \
  --key-schema AttributeName=slug,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**TODO**: explain the meaning of every parameter

If the previous command was executed successfully you should see an output like the following:

```json
{
    "TableDescription": {
        "TableArn": "arn:aws:dynamodb:eu-west-1:1234567890:table/gig",
        "AttributeDefinitions": [
            {
                "AttributeName": "slug",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0,
            "WriteCapacityUnits": 5,
            "ReadCapacityUnits": 5
        },
        "TableSizeBytes": 0,
        "TableName": "gig",
        "TableStatus": "CREATING",
        "KeySchema": [
            {
                "KeyType": "HASH",
                "AttributeName": "slug"
            }
        ],
        "ItemCount": 0,
        "CreationDateTime": 1509542361.233
    }
}
```


## 02.03 - Load data into DynamoDB

Data file is prepared and located in [`resources/dynamodb/gig.json`](/resources/dynamodb/gig.json).

```bash
aws dynamodb batch-write-item --request-items file://resources/dynamodb/gig.json
```

If the command was executed successfully you should see the following output:

```json
{
    "UnprocessedItems": {}
}
```

**TODO**: add tips regarding the format of the `gig.json` file


## 02.04 - Read data from DynamoDB

if you execute this command

```bash
aws dynamodb scan --table-name gig
```

it will return all entries in the dynamoDB table.


...


## Verify

If in step 02.04 you were able to see all the records (12 in totals), then you executed all the steps correctly.

A quick way to re-verify this would be to run the following command:

```bash
aws dynamodb scan --table-name gig | grep ScannedCount
```

If you get `"ScannedCount": 12,` as output, well, congratulations, you can now move forward to the next lesson! 🎉


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 01 — Deploying the frontend](../01-deploying-frontend) | [03 — ... ▶︎](../03...) |
