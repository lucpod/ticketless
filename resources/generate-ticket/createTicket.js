const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const { createContent, createQRCode } = require('./QRCode')

module.exports = (gig, ticket, privateKey) => new Promise((resolve, reject) => {
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
      // SVGtoPDF(doc, codeSVG, 10, 10, {})

      doc
        .rect(10, 10, 300, 600)
        .fill('gray')
        .rect(12, 12, 296, 596)
        .fill('white')
        .fontSize(25)
        .text('Ticketless', 100, 80)
        .save()
        .end()

      return resolve(doc)
    })
})
