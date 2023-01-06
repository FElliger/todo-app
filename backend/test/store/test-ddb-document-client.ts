import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateCommand,
  UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb"

export class TestDynamoDBDocumentClient<T extends Record<string, any>> {
  tables: {
    [key: string]: T[]
  } = {}

  async send(
    command: PutCommand | QueryCommand | UpdateCommand
  ): Promise<PutCommandOutput | QueryCommandOutput | UpdateCommandOutput> {
    if (command instanceof PutCommand) {
      return this.handlePut(command)
    } else if (command instanceof UpdateCommand) {
      return this.handleUpdate(command)
    } else {
      return this.handleQuery(command)
    }
  }

  getItems(tableName: string): T[] {
    return this.tables[tableName]
  }

  asDynamoDBDocumentClient(): DynamoDBDocumentClient {
    return this as unknown as DynamoDBDocumentClient
  }

  private async handlePut(command: PutCommand): Promise<PutCommandOutput> {
    const tableName = `${command.input.TableName}`
    const item = command.input.Item as T

    const existingTableItems = this.tables[tableName] ?? []
    this.tables[tableName] = [...existingTableItems, item]

    return { $metadata: {} }
  }

  private async handleUpdate(command: UpdateCommand): Promise<UpdateCommandOutput> {
    const tableName = `${command.input.TableName}`
    const key = command.input.Key ?? {}
    const values = command.input.ExpressionAttributeValues ?? {}
    const updateExpression = `${command.input.UpdateExpression}`

    const item = this.getItems(tableName).find((item) => Object.keys(key).every((k) => key[k] === item[k])) as Record<
      string,
      any
    >
    const expressionParts = updateExpression.split(" ")
    let mode: string | undefined

    expressionParts.forEach((part) => {
      if (part === "SET" || part === "REMOVE") {
        mode = part
        return
      }
      if (part.endsWith(",")) {
        part = part.substring(0, part.length - 1)
      }

      if (mode === "SET") {
        const [key, value] = part.split("=")
        item[key] = values[value]
      } else if (mode === "REMOVE") {
        delete item[part]
      } else {
        throw `No or unknown mode during update. Mode: ${mode} Update: ${part}`
      }
    })

    return { $metadata: {}, Attributes: item }
  }

  private async handleQuery(command: QueryCommand): Promise<QueryCommandOutput> {
    const tableName = `${command.input.TableName}`
    const keyExpression = `${command.input.KeyConditionExpression}`
    const values = command.input.ExpressionAttributeValues ?? {}

    let keyExpWithValues = keyExpression
    Object.keys(values).forEach((key) => {
      const value = values[key] as string
      keyExpWithValues = keyExpWithValues.replaceAll(key, value)
    })

    if (keyExpWithValues.match(/^[a-zA-Z0-9-_+]+ = [a-zA-Z0-9-_+]+$/)) {
      const keyAttribute = keyExpWithValues.split("=")[0].trim()
      const keyValue = keyExpWithValues.split("=")[1].trim()

      const result = this.getItems(tableName).filter((item: T) => item[keyAttribute] === keyValue)
      return {
        $metadata: {},
        Count: result.length,
        Items: result,
      }
    } else {
      throw `KeyConditionExpression "${keyExpression}" not supported by this test client`
    }
  }
}
