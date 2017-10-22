const fs = require('fs')
const path = require('path')
const { createContent, createQRCode } = require('./QRCode')

const privateKey = fs.readFileSync(path.join(__dirname, 'sample.key'))
const content = createContent(
  'Luciano',
  'sample-concert-somewhere',
  '2018-12-10',
  22,
  privateKey
)

createQRCode(content, (_, code) => console.log(code))
