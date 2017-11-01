const fs = require('fs')
const path = require('path')
const createTicket = require('./createTicket')

const privateKey = fs.readFileSync(path.join(__dirname, 'sample.key'))

createTicket({}, {}, privateKey)
  .then((document) => {
    document.pipe(fs.createWriteStream('ticket.pdf'))
  })
