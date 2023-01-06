import { APIGatewayProxyEvent, Context } from "aws-lambda"
import { Todo, TodoItem } from "../src/store/model"
import { TodoClient, TodoDynamoDBClient } from "../src/store/todo-client"
import { TestDynamoDBDocumentClient } from "./store/test-ddb-document-client"

export function getAPIGatewayProxyEvent(method: string, path: string, body?: string): APIGatewayProxyEvent {
  return {
    httpMethod: method.toUpperCase(),
    path,
    body,
  } as unknown as APIGatewayProxyEvent
}

export function getContext(): Context {
  return {} as unknown as Context
}

export function getTodoItem(text: string, username = "user"): TodoItem {
  return {
    username,
    text,
  }
}

export function getTodo(text: string, username = "user"): Todo {
  return { ...getTodoItem(text, username) }
}

export function getTodoClient(): TodoClient {
  const ddbClient = new TestDynamoDBDocumentClient<TodoItem>().asDynamoDBDocumentClient()
  return new TodoDynamoDBClient(ddbClient, "test-todos")
}
