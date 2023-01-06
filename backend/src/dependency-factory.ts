import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

export function getDdbClient() {
  if (process.env.OVERRIDE_DDB_ENDPOINT) {
    const ddbEndpoint = process.env.OVERRIDE_DDB_ENDPOINT
    console.info(`Custom DDB endpoint: ${ddbEndpoint}`)
    return new DynamoDBClient({ endpoint: ddbEndpoint })
  }

  return new DynamoDBClient({})
}

export function getDdbDocumentClient(ddbClient: DynamoDBClient = getDdbClient()) {
  return DynamoDBDocumentClient.from(ddbClient, {})
}
