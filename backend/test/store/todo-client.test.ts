import { TodoDynamoDBClient } from "../../src/store/todo-client"
import { TodoItem } from "../../src/store/model"
import { TestDynamoDBDocumentClient } from "./test-ddb-document-client"
import { getTodoItem } from "../test-object-factory"

describe("TodoDynamoDBClient", () => {
  const tableName = "todo-test-data"
  let client: TodoDynamoDBClient
  let documentClient: TestDynamoDBDocumentClient<TodoItem>

  beforeEach(() => {
    documentClient = new TestDynamoDBDocumentClient<TodoItem>()
    client = new TodoDynamoDBClient(documentClient.asDynamoDBDocumentClient(), tableName)
  })

  it("creates the todo in DynamoDB", async () => {
    const todo = getTodoItem("Do something")

    await client.create(todo)

    expect(documentClient.getItems(tableName)).toStrictEqual([todo])
  })

  it("fetches a list of todos from DynamoDB", async () => {
    const username = "testUser"
    const todo1 = await client.create(getTodoItem("Do this", username))
    const todo2 = await client.create(getTodoItem("Do that", username))
    await client.create(getTodoItem("Do something else", "other user"))

    const result = await client.list(username)

    expect(result).toStrictEqual([todo1, todo2])
  })

  it("marks a todo as done in DynamoDB", async () => {
    const todo = await client.create(getTodoItem("Something that'll soon be done"))
    const key = { username: todo.username, todoId: `${todo.todoId}` }

    const doneResponse = await client.update(key, { done: true })
    const todos = await client.list(todo.username)

    expect(doneResponse.done).toBe(true)
    expect(doneResponse.doneAt).toBeDefined()
    expect(doneResponse.timeToLive).toBeDefined()
    expect(todos).toStrictEqual([doneResponse])
  })

  it("marks a todo as undone in DynamoDB", async () => {
    const todo = await client.create(getTodoItem("Something that'll soon be done and then undone again"))
    const key = { username: todo.username, todoId: `${todo.todoId}` }
    await client.update(key, { done: true })

    const undoResponse = await client.update(key, { done: false })
    const todos = await client.list(todo.username)

    expect(undoResponse.done).toBeFalsy()
    expect(undoResponse.doneAt).not.toBeDefined()
    expect(undoResponse.timeToLive).not.toBeDefined()
    expect(todos).toStrictEqual([undoResponse])
  })
})
