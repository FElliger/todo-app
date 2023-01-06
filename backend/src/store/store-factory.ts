import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { getDdbDocumentClient } from "../dependency-factory"
import { TodoClient, TodoDynamoDBClient } from "./todo-client"
import { TodoDataStore } from "./todo-data-store"

export function getTodoClient(
  ddbDocClient: DynamoDBDocumentClient = getDdbDocumentClient(),
  tableName = "todo-data"
): TodoClient {
  return new TodoDynamoDBClient(ddbDocClient, tableName)
}

export function getTodoDataStore(todoClient: TodoClient = getTodoClient()): TodoDataStore {
  return new TodoDataStore(todoClient)
}
