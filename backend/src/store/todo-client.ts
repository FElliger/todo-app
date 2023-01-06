import { v4 as uuid } from "uuid"
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { TodoItem, TodoItemKey, TodoItemUpdate } from "./model"

const FIVE_DAYS_IN_SECONDS = 5 * 24 * 60 * 60

export interface TodoClient {
  create(todo: TodoItem): Promise<TodoItem>
  list(username: string): Promise<TodoItem[]>
  update(key: TodoItemKey, update: TodoItemUpdate): Promise<TodoItem>
}

export class TodoClientError extends Error {
  __proto__ = Error

  constructor(message: string, readonly context: Record<string, any>) {
    super(message)
    Object.setPrototypeOf(this, TodoClientError.prototype)
  }
}

export class TodoDynamoDBClient implements TodoClient {
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient, private readonly tableName: string) {}

  async create(todo: TodoItem): Promise<TodoItem> {
    if (!todo.todoId) {
      todo.todoId = uuid()
    }

    const putCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...todo,
      },
    })

    try {
      await this.ddbDocClient.send(putCommand)
      return todo
    } catch (err: unknown) {
      console.error(`Call to DynamoDB failed for operation: CREATE, item: ${JSON.stringify(todo)}`, err)
      throw new TodoClientError("Failed to create item", { todo })
    }
  }

  async list(username: string): Promise<TodoItem[]> {
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "username = :u",
      ExpressionAttributeValues: {
        ":u": username,
      },
    })

    try {
      const response = await this.ddbDocClient.send(queryCommand)
      return (response.Items ?? []) as unknown[] as TodoItem[]
    } catch (err: unknown) {
      console.log(`Call to DynamoDB failed for operation: LIST, username: ${username}`, err)
      throw new TodoClientError("Failed to fetch todo list", { username })
    }
  }

  async update(key: TodoItemKey, update: TodoItemUpdate): Promise<TodoItem> {
    const updates: Record<string, string[]> = {
      SET: [],
      REMOVE: [],
    }
    let expressionAttributeValues: Record<string, any> = {}

    if (update.done !== undefined) {
      if (update.done) {
        const time = Date.now()
        const ttl = Math.floor(time / 1000) + FIVE_DAYS_IN_SECONDS

        updates.SET.push("done=:d", "doneAt=:at", "timeToLive=:t")
        expressionAttributeValues = { ...expressionAttributeValues, ":d": true, ":at": time, ":t": ttl }
      } else {
        updates.REMOVE.push("done", "doneAt", "timeToLive")
      }
    }

    let updateExpression = ""
    Object.keys(updates).forEach((key) => {
      if (updates[key].length > 0) {
        updateExpression = `${updateExpression} ${key} ${updates[key].join(", ")}`
      }
    })

    const updateCommand = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        ...key,
      },
      UpdateExpression: updateExpression.trim(),
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })

    try {
      const response = await this.ddbDocClient.send(updateCommand)
      return response.Attributes as unknown as TodoItem
    } catch (err: unknown) {
      console.error(`Call to DynamoDB failed for operation: UPDATE todokey: ${JSON.stringify(key)}`, err)
      throw new TodoClientError("Failed to update todo!", { key })
    }
  }
}
