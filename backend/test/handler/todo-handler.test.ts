import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { TodoHandler } from "../../src/handler/todo-handler"
import { TodoDataStore } from "../../src/store/todo-data-store"
import { getAPIGatewayProxyEvent, getContext, getTodoClient } from "../test-object-factory"

describe("TodoHandler", () => {
  let dataStore: TodoDataStore
  let handler: TodoHandler
  const context = getContext()

  beforeEach(() => {
    dataStore = new TodoDataStore(getTodoClient())
    handler = new TodoHandler(dataStore)
  })

  it("adds the todo to the data store on POST", async () => {
    const todoText = "This is what I need to do"
    const response = await createTodo(todoText)

    expect(response.text).toBe(todoText)
    const expectedTodo = await dataStore.list(response.username)
    expect(response).toStrictEqual(expectedTodo[0])
  })

  it("returns the user's todo list on GET", async () => {
    const todo1 = await createTodo("todo#1")
    const todo2 = await createTodo("todo#2")

    const request = getAPIGatewayProxyEvent("GET", "/")
    const response = await performRequestAndReturnBody(request)

    expect(response.todos).toStrictEqual([todo1, todo2])
  })

  it("returns the updated todo on PUT", async () => {
    const todo = await createTodo("Something must be done")
    expect(todo.todoId).toBeDefined()
    expect(todo.done).toBeFalsy()

    const request = getAPIGatewayProxyEvent("PUT", `/${todo.todoId}`, JSON.stringify({ done: true }))
    const response = await performRequestAndReturnBody(request)

    expect(response.todoId).toBe(todo.todoId)
    expect(response.done).toBe(true)
  })

  it("returns the updated todo on GET after PUT", async () => {
    const todo = await createTodo("Something needs to be done")
    const updateRequest = getAPIGatewayProxyEvent("PUT", `/${todo.todoId}`, JSON.stringify({ done: true }))
    const updatedTodo = await performRequestAndReturnBody(updateRequest)

    const listRequest = getAPIGatewayProxyEvent("GET", "/")
    const response = await performRequestAndReturnBody(listRequest)

    expect(response.todos).toStrictEqual([updatedTodo])
  })

  async function createTodo(text: string): Promise<any> {
    const request = getAPIGatewayProxyEvent("POST", "/", JSON.stringify({ text: text }))

    return performRequestAndReturnBody(request)
  }

  async function performRequestAndReturnBody(request: APIGatewayProxyEvent): Promise<any> {
    const response = await performRequest(request)
    return JSON.parse(response.body)
  }

  async function performRequest(request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return handler.handle(request, context)
  }
})
