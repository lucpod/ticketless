# Ticketless — getting started with Serverless and Lambda functions

## YEAH! 🤘

If you are reading this page you probably completed the tutorial, if so, well done!

In this page you have some ideas for improving the application and for further learning.

I hope you had fun along the way and that's just the beginning of your Serverless fun!


## Ideas for further improvements:

  - Use the module [`lambda-proxy-response`](https://www.npmjs.com/package/lambda-proxy-response) to simplify the creation of responses and make the code more readable (or you can also write your own module for that!)
  - Improve validation logic in the ticket purchase API (see hints in the code)
  - Improve the `listGigs` API to support pagination
  - Create a new DynamoDB table for tracking tickets and store them (you can also store the delivery state for sending the ticket via email)
  - Manage tickets availability and make a customer can't purchase tickets for sold-out events (this might require changes also in the frontend)
  - If you want to get very fancy you can also create a system that locks a ticket for a given amount of time while the user is filling the form for the purchase.
  - Integrate a real payment system like [Stripe](https://stripe.com/ie) or [Braintree](https://www.braintreepayments.com) in the purchase API and process the payments against them (of course in test mode 😇)
  - The current email sent to the user after a purchase is quite ugly, can you make it better, maybe using some HTML template rather than plain text?
  - Also, it could be nice to attach to the email a nice pdf version of the ticket, maybe with some fancy barcode...
  - The worker scheduling is currently based on a schedule rule that allows us to process only one message per minute. This is not very scalable. Can you think of any solution that will allows us to make it more scalable?
  - Also there are many other architectures and AWS services that can allow you to have a queue of messages to process. You might want to have a look at [DynamoDB streams](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html) and [Kinesis](https://aws.amazon.com/kinesis/).


## Resources for learning

  - [Build your first Serverless Web Application (by AWS)](https://aws.amazon.com/serverless/build-a-web-app/)
  - [Getting Started with Serverless Computing on AWS (by Cloud Academy)](https://cloudacademy.com/learning-paths/getting-started-serverless-computing-25/)
  - [AWS Lambda and the Serverless Framework - Hands On Learning! (by Udemy)](https://www.udemy.com/learn-aws-lambda-and-the-serverless-framework-hands-on/)
  - [Build a Serverless Application with Code Star (by AWS) ](https://aws.amazon.com/getting-started/tutorials/build-serverless-application/)
  - [Build a Serverless Blog Web Application (by AWS)](https://aws.amazon.com/serverless/refarch/refarch-webapp/)
  - [Introduction to Serverless (by envato)](https://code.tutsplus.com/courses/introduction-to-serverless)
  - [The Serverless Stack (article)](https://hackernoon.com/the-serverless-stack-3ae91031f050)
  - [Serverless Node with AWS Lambda, API Gateway and DynamoDB (article)](https://node.university/blog/1176932/aws-serverless)
  - [Going Serverless | AWS Lambda and Kinesis streams at busuu (article)](https://tech.busuu.com/going-serverless-aws-lambda-and-kinesis-streams-at-busuu-1434afe62041)
  - [Aws Lambda in Action - Danilo Poccia (book)](https://www.manning.com/books/aws-lambda-in-action)
  - [Serverless Architectures on AWS - Peter Sbarski (book)](https://www.manning.com/books/serverless-architectures-on-aws)
  - [How to use Native Addon on AWS](https://aws.amazon.com/it/blogs/compute/nodejs-packages-in-lambda)


## Alternative frameworks

SAM is the official solution from AWS to manage Serverless applications, but there are a lot of alternatives out there, be sure to check them out to wide your horizons:

  - [Serverless framework](https://serverless.com)
  - [Apex framework](http://apex.run)
  - [Dawson.sh](https://github.com/dawson-org/dawson-cli)
  - [Cloudformation](https://aws.amazon.com/cloudformation) or [Terraform](https://www.terraform.io) (If you really want to go low level)

## Middleware frameworks

Writing Lambda code sometimes ends up in a lot of duplication around things like: validation,
error management, response creation, input parsing, etc.

If you end up feeling that there should be a better way to write your Lambda code,
check out [Middy](https://middy.js.org/), a middleware engine for AWS Lambda in Node.js
