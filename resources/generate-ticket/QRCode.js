const jwt = require('jsonwebtoken')
const qr = require('qrcode')

module.exports.createContent = (
  customerName,
  gigSlug,
  concertDate,
  sequenceId,
  privateKey
) => jwt
  .sign(
    {
      sub: customerName,
      aud: gigSlug,
      iat: Date.now(),
      nbf: (new Date(concertDate)).getTime(),
      exp: (new Date(concertDate)).getTime() + 86400000,
      jti: sequenceId
    },
    privateKey,
    {
      algorithm: 'RS256'
    }
  )

module.exports.createQRCode = (content) => new Promise((resolve, reject) => {
  qr.toString(content, { type: 'svg' }, (err, code) => {
    if (err) {
      return reject(err)
    }

    return resolve(code)
  })
})
