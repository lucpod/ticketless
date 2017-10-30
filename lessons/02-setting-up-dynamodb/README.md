# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 01 — Deploying the frontend](../01-deploying-frontend) | [03 — ... ▶︎](../03...) |


## Lesson 02 — Setting up DynamoDB


### Goal

In this lesson we will learn how to use Dynamo DB, how to create a table and how to load it with data from a file.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#xxx)
- [yyy](#yyy)
- [zzz](#zzz)


## 02.01 - Create a DynamoDB table

Amazon DynamoDB is a fast and flexible NoSQL database service for all applications that need consistent, single-digit millisecond latency at any scale. It is a fully managed cloud database and supports both document and key-value store models.

...



### Gig table fields:

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


### Indexes

...


## 02.02 - Load data into DynamoDB

...


## 02.03 - Read data from DynamoDB

...


## Verify

...


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 01 — Deploying the frontend](../01-deploying-frontend) | [03 — ... ▶︎](../03...) |
