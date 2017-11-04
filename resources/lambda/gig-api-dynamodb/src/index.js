const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

exports.listGigs = (event, context, callback) => {
  const params = {
    TableName: 'gig'
  }

  docClient.scan(params, (err, data) => {
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
  // const gigSlug = event.pathParameters.slug
  // const gig = mockGigs.find(gig => gig.slug === gigSlug)
  //
  // if (!gig) {
  //   // if the gig with the given slug is not found return a 404
  //   return callback(null, {
  //     statusCode: 404,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Access-Control-Allow-Origin': '*'
  //     },
  //     body: JSON.stringify({error: 'Gig not found'})
  //   })
  // }
  //
  // return callback(null, {
  //   statusCode: 200,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Access-Control-Allow-Origin': '*'
  //   },
  //   body: JSON.stringify(gig)
  // })
}
