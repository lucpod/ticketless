const PDFDocument = require('pdfkit')
const { createContent, createQRCode } = require('./QRCode')

const createPdfStream = (gig, ticket, privateKey) => {
  const doc = new PDFDocument()

  const QRCodeContent = createContent(
    'Luciano',
    'sample-concert-somewhere',
    '2018-12-10',
    22,
    privateKey
  )

  createQRCode(QRCodeContent)
    .then(codeSVG => {
      // TODO
    })
}
