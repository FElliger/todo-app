import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { Todo, TodoUpdate } from "../store/model"
import { TodoDataStore } from "../store/todo-data-store"
import { ResourceHandler } from "./resource-handler"

export class TodoHandler implements ResourceHandler {
  constructor(private readonly dataStore: TodoDataStore) {}

  async handle(request: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    console.info(`[${context.awsRequestId}] [TodoHandler] Received ${request.httpMethod} request to ${request.path}`)

    //TODO request validation

    const requestContext = this.getRequestContext()

    switch (request.httpMethod.toUpperCase()) {
      case "POST": {
        return this.handlePost(request, requestContext)
      }
      case "GET": {
        return this.handleGet(requestContext)
      }
      case "PUT": {
        return this.handlePut(request, requestContext)
      }
    }

    return {
      body: "Not Found",
      statusCode: 404,
    }
  }

  private async handlePost(
    request: APIGatewayProxyEvent,
    requestContext: RequestContext
  ): Promise<APIGatewayProxyResult> {
    const bodyAsJSON = this.getBodyAsJSON(request)
    const newTodo: Todo = {
      text: bodyAsJSON.text,
      username: requestContext.username,
    }

    const todo = await this.dataStore.add(newTodo)
    return {
      statusCode: 200,
      body: JSON.stringify(todo),
    }
  }

  private async handleGet(requestContext: RequestContext): Promise<APIGatewayProxyResult> {
    const todos = await this.dataStore.list(requestContext.username)

    return {
      statusCode: 200,
      body: JSON.stringify({ todos }),
    }
  }

  private async handlePut(
    request: APIGatewayProxyEvent,
    requestContext: RequestContext
  ): Promise<APIGatewayProxyResult> {
    if (request.path === "" || request.path === "") {
      console.warn(`PUT called without path indicating a todo ID. Invalid request. Path: "${request.path}"`)
      return {
        statusCode: 405,
        body: "Method not allowed",
      }
    }

    let todoId = request.path
    if (todoId.startsWith("/")) {
      todoId = todoId.substring(1)
    }

    const key = { username: requestContext.username, todoId }
    const update = this.getBodyAsJSON(request) as TodoUpdate

    const updatedTodo = await this.dataStore.update(key, update)
    return {
      statusCode: 200,
      body: JSON.stringify(updatedTodo),
    }
  }

  private getRequestContext(): RequestContext {
    return {
      //TODO replace with actual user once authenticated
      username: "demo",
    }
  }

  private getBodyAsJSON(request: APIGatewayProxyEvent): any {
    try {
      return JSON.parse(request.body ?? "")
    } catch (err: unknown) {
      console.error("Error while parsing JSON from request body")
      //TODO throw custom "bad request" error here
      throw err
    }
  }
}

type RequestContext = {
  username: string
}
