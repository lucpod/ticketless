// generates some mock data, we will later on replace this with a query to
// fetch data from DynamoDB
const mockGigs = [ ...Array(12).keys() ].map(i => ({
  slug: `band${i}-location${i}`,
  bandName: `Mock Band ${i}`,
  city: `Mock City ${i}`,
  year: '1961',
  date: '2019-01-01',
  venue: `Mock Venue ${i}`,
  collectionPointMap: 'map-placeholder.png',
  collectionPoint: 'New York, NY 10001, USA',
  collectionTime: '14:30',
  originalDate: '1977-02-05',
  capacity: 3000,
  description: `Mock description ${i}`,
  image: 'band-placeholder.png',
  price: '1010'
}))

exports.listGigs = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({gigs: mockGigs})
  }

  return callback(null, response)
}

exports.gig = (event, context, callback) => {
  console.log(event)
  const gigSlug = event.pathParameters.slug
  const gig = mockGigs.find(gig => gig.slug === gigSlug)

  if (!gig) {
    // if the gig with the given slug is not found return a 404
    return callback(null, {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({error: 'Gig not found'})
    })
  }

  return callback(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(gig)
  })
}
