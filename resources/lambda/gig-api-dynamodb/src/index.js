const AWS = require('aws-sdk')
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
