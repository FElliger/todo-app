#! /bin/bash

i="0"
table_name="todo-data"
local_port="8000"
local_endpoint="http://localhost:$local_port"

echo -n "Waiting for local DynamoDB to start..."
while [ $i -lt 60 ]; do
	check=$(ss -tulw | grep LISTEN | grep :$local_port)
	if [ $? -eq 0 ]; then
		echo "."
		echo "Port 8000 is listening. Assuming the local DynamoDB is up!"
		break
	fi
	echo -n "."
	sleep 5 
done

echo "Waiting 10 seconds to give enough time to DynamoDB to really start up..."
sleep 10

echo "Making sure that the required table is in place..."
aws dynamodb describe-table --table-name $table_name --endpoint-url $local_endpoint > /dev/null

if [ $? -gt 0 ]; then
	echo "Couldn't find table \"$table_name\". Creating it..."
	aws dynamodb create-table --table-name $table_name --attribute-definitions AttributeName=username,AttributeType=S AttributeName=todoId,AttributeType=S --key-schema AttributeName=username,KeyType=HASH AttributeName=todoId,KeyType=RANGE --billing-mode PAY_PER_REQUEST --endpoint-url $local_endpoint> /dev/null

	echo "Waiting 5 seconds for table to be provisioned..."
	sleep 5

	echo "Configuring time-to-live..."
	aws dynamodb update-time-to-live --table-name $table_name --time-to-live-specification Enabled=true,AttributeName=timeToLive --endpoint-url $local_endpoint
fi

if [ $? -eq 0 ]; then 
	echo "Table $table_name is ready to be used."
fi
