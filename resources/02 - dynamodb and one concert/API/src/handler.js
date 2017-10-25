import AWS from 'aws-sdk';

exports.handler = (event, context, callback) => {
  const gigs = [];
  const { slug } = event.pathParameters;
  AWS.config.update({
    region: 'us-east-1',
  });

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'concert',
    KeyConditionExpression: '#sg = :slug', // dont need this unless field is a reserved word
    ExpressionAttributeNames: {
      '#sg': 'slug',
    },
    ExpressionAttributeValues: {
      ':slug': slug,
    },
  };

  docClient.query(params, (err, data) => {
    if (err) {
      console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach((gig) => {
        gigs.push(gig);
      });
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gigs),
      };
      callback(null, response);
    }
  });
};
