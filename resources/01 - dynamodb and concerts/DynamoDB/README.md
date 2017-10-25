Place blurb about Dynamodb and designing tables.
Cover HASH and RANGE
puts overwrites



steps
1  Download http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html
2. java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
3. aws dynamodb create-table \
    --table-name concert \
    --attribute-definitions \
    AttributeName=slug,AttributeType=S \
    AttributeName=city,AttributeType=S \
    --key-schema AttributeName=slug,KeyType=HASH AttributeName=city,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url http://localhost:8000
    or

    aws dynamodb create-table \
    --table-name concert \
    --attribute-definitions \
    AttributeName=slug,AttributeType=S \
    --key-schema AttributeName=slug,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url http://localhost:8000


4. aws dynamodb list-tables --endpoint-url http://localhost:8000.
5. aws dynamodb batch-write-item --request-items file://concerts.json --endpoint-url http://localhost:8000
6. aws dynamodb scan --table-name concerts --endpoint-url http://localhost:8000
7. aws dynamodb delete-table --table-name concert --endpoint-url h
ttp://localhost:8000
   