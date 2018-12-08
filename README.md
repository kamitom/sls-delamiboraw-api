# demo for delete amibo table items by Phone

## Step 1: Create your DynamoDB Table
Execute following CLI command to create a table called: **AppSync-Destinations**

    aws dynamodb create-table --table-name AppSync-Destinations --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 --profile tomrd

## Step 2: load data with json file
Execute the following CLI command to load the table with a few testing records:

    aws dynamodb batch-write-item --request-items file://Destinations.json --profile tomrd