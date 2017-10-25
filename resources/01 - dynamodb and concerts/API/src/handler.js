const AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    let concerts = [];
    AWS.config.update({
        region: "us-east-1",
      //  endpoint: "http://localhost:8000"
    });

    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: "concert"
    };

    console.log("Scanning concert table.");
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the concerts
            console.log("Scan succeeded.");
            data.Items.forEach(function(concert) {
                concerts.push(concert);
            });
            const response = {
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json'
                },
                body:  JSON.stringify(concerts)
              }
            callback(null, response );
        }
    }
}
