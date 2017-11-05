const AWS = require('aws-sdk')
const validator = require('validator')

const docClient = new AWS.DynamoDB.DocumentClient()

exports.listGigs = (event, context, callback) => {
  const queryParams = {
    TableName: 'gig'
  }

  docClient.scan(queryParams, (err, data) => {
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

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({gigs: data.Items})
    }

    return callback(null, response)
  })
}

exports.gig = (event, context, callback) => {
  const gigSlug = event.pathParameters.slug

  const queryParams = {
    Key: {
      slug: gigSlug
    },
    TableName: 'gig'
  }

  docClient.get(queryParams, (err, data) => {
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
    if (!data.Item) {
      return callback(null, {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({error: 'Gig not found'})
      })
    }

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data.Item)
    }

    return callback(null, response)
  })
}

exports.purchaseTicket = (event, context, callback) => {
  // receives a JSON in the event.body containing:
  //   - gig: needs to be an existing gig
  //   - name: non empty string
  //   - email: valid email
  //   - cardNumber: valid credit card number
  //   - cardExpiryMonth: required (int between 1 and 12)
  //   - cardExpiryYear: required (int between 2018 and 2024) (month and year in the future)
  //   - cardCVC: required (valid cvc)
  //   - disclaimerAccepted: required (true)
  //
  //   Must return a validation error (400 Bad request) with the following object:
  //   {error: "Invalid request", errors: [{field: "fieldName", message: "error message"}]}
  //
  //   or, in case of success a 202 (Accepted) with body { success: true }

  let data

  // parses the input
  try {
    data = JSON.parse(event.body)
  } catch (err) {
    return callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({error: 'Invalid content, expected valid JSON'})
    })
  }

  // validates every field
  const errors = []

  // gig: needs to be an existing gig
  if (!data.gig) {
    errors.push({field: 'gig', message: 'field is mandatory'})
    // validating if the gig exists in DynamoDB is left as an exercise
  }

  // name: non empty string
  if (!data.name) {
    errors.push({field: 'name', message: 'field is mandatory'})
  }

  // email: valid email
  if (!data.email) {
    errors.push({field: 'email', message: 'field is mandatory'})
  } else if (!validator.isEmail(data.email)) {
    errors.push({field: 'email', message: 'field is not a valid email'})
  }

  // cardNumber: valid credit card number
  if (!data.cardNumber) {
    errors.push({field: 'cardNumber', message: 'field is mandatory'})
  } else if (!validator.isCreditCard(data.cardNumber)) {
    errors.push({field: 'cardNumber', message: 'field is not a valid credit card number'})
  }

  // cardExpiryMonth: required (int between 1 and 12)
  if (!data.cardExpiryMonth) {
    errors.push({field: 'cardExpiryMonth', message: 'field is mandatory'})
  } else if (!validator.isInt(String(data.cardExpiryMonth), {min: 1, max: 12})) {
    errors.push({field: 'cardExpiryMonth', message: 'field must be an integer in range [1,12]'})
  }

  // cardExpiryYear: required (month and year in the future)
  if (!data.cardExpiryYear) {
    errors.push({field: 'cardExpiryYear', message: 'field is mandatory'})
  } else if (!validator.isInt(String(data.cardExpiryYear), {min: 2018, max: 2024})) {
    errors.push({field: 'cardExpiryYear', message: 'field must be an integer in range [2018,2024]'})
  }

  // validating that expiry is in the future is left as exercise
  // (consider using a library like moment.js)

  // cardCVC: required (valid cvc)
  if (!data.cardCVC) {
    errors.push({field: 'cardCVC', message: 'field is mandatory'})
  } else if (!String(data.cardCVC).match(/^[0-9]{3,4}$/)) {
    errors.push({field: 'cardCVC', message: 'field must be a valid CVC'})
  }

  // disclaimerAccepted: required (true)
  if (data.disclaimerAccepted !== true) {
    errors.push({field: 'disclaimerAccepted', message: 'field must be true'})
  }

  // if there are errors, return a 400 with the list of errors

  if (errors.length) {
    return callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({error: 'Invalid Request', errors})
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
}

exports.cors = (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'
    },
    body: ''
  })
}
