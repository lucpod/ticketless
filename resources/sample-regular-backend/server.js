'use strict'

const data = require('./data')

module.exports = function (fastify, opts, next) {
  fastify.get('/gigs', function (request, reply) {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .send({ gigs: data })
  })

  fastify.get('/gigs/:slug', function (request, reply) {
    const gig = data.find(g => g.slug === request.params.slug)

    if (!gig) {
      return reply
        .code(404)
        .header('Access-Control-Allow-Origin', '*')
        .send(new Error('Not Found'))
    }

    reply
      .header('Access-Control-Allow-Origin', '*')
      .send(gig)
  })

  next()
}
