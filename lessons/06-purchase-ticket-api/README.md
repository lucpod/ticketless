# Ticketless — getting started with Serverless and Lambda functions

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 05 — Integrating API with DynamoDB](../05-api-with-dynamodb)| [07 — ... ▶︎](../) |


## Lesson 06 — Purchase ticket API


### Goal

In this lesson we will learn how to create an API that receives data through an HTTP POST request. How to do validation in lambdas and how to use external libraries.

If you are already familiar with those concepts you can use the following Cloudformation template to apply the changes expected by this lesson and move forward to the next lesson.

**TODO**: add Cloudformation template


### Contents

- [xxx](#xxx)
- [xxx](#xxx)
- [xxx](#xxx)


## 06.01 - Using external dependencies from NPM

In the Lambda functions code it is possible to use external dependencies from NPM as in any other Node.js project.

In order to use external dependencies, we have to create a `package.json` file in our `src` folder.

To do so, move your command line inside the `src` folder and run:

```bash
npm init -y
```

This command will create a default package file.

Now, in the same folder, we can install any library by just running:

```bash
npm install --save <libraryName>
```

In our next function we will need to write some validation code, so we can use the `validator` library. To install this library we have tu run:

```bash
npm install --save validator
```

If everything went fine, you will notice that in our `src` folder we now have a `node_modules/validator` subfolder.

At this point, we can require this library in our Lambda code with:

```javascript
const validator = require('validator')
```

> 💡 **TIP**: The uncompressed source code in Lambda needs to be smaller than 250MB ([source](http://docs.aws.amazon.com/lambda/latest/dg/limits.html)). When using dependencies this way, every dependency (including devDependency) is moved into the lambda code and you might end up hitting this hard limit. Sometimes, in complex scenarios, it might be worth to adopt tools like [Webpack](https://webpack.js.org) and/or [Rollup](https://rollupjs.org/) to compile the code, process the dependency tree and make sure to include in the resulting file only the dependencies functionalities that are really used in your application code ([tree-shaking](https://webpack.js.org/guides/tree-shaking/)).


## 06.02 - API for tickets purchase

...


---

| Previous lesson  | Next lesson      |
| :--------------- | ---------------: |
| [◀︎ 05 — Integrating API with DynamoDB](../05-api-with-dynamodb)| [07 — ... ▶︎](../) |
