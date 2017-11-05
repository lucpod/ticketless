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


## Resources for learning

  - **TODO**


## Alternative frameworks

SAM is the official solution from AWS to manage Serverless applications, but there are a lot of alternatives out there, be sure to check them out to wide your horizons:

  - [Serverless framework](https://serverless.com)
  - [Apex framework](http://apex.run)
  - [Dawson.sh](https://github.com/dawson-org/dawson-cli)
  - [Cloudformation](https://aws.amazon.com/cloudformation) or [Terraform](https://www.terraform.io) (If you really want to go low level)
