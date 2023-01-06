import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ResourceHandler } from "../src/handler/resource-handler"
import { RequestDispatcher } from "../src/request-dispatcher"
import { getAPIGatewayProxyEvent, getContext } from "./test-object-factory"

const returnHello: ResourceHandler = {
  handle: async () => {
    return { body: "Hello", statusCode: 200 }
  },
}

const returnWorld: ResourceHandler = {
  handle: async () => {
    return { body: "World", statusCode: 200 }
  },
}

const returnPath: ResourceHandler = {
  handle: async (request: APIGatewayProxyEvent) => {
    return { body: request.path, statusCode: 200 }
  },
}

describe("RequestDispatcher", () => {
  let dispatcher: RequestDispatcher
  const context = getContext()

  beforeEach(() => {
    dispatcher = new RequestDispatcher({
      "/hello": returnHello,
      "/world": returnWorld,
      "/get": returnPath,
    })
  })

  it("matches full path", async () => {
    const request = getAPIGatewayProxyEvent("GET", "/hello")

    const response = await dispatcher.dispatch(request, context)

    const expectedResponse = await returnHello.handle(request, context)
    expect(response).toStrictEqual(expectedResponse)
  })

  it("matches by path starting with", async () => {
    const request = getAPIGatewayProxyEvent("GET", "/world/and")

    const response = await dispatcher.dispatch(request, context)

    const expectedResponse = await returnWorld.handle(request, context)
    expect(response).toStrictEqual(expectedResponse)
  })

  it("returns 404 - Not Found if no path matches", async () => {
    const request = getAPIGatewayProxyEvent("GET", "/outer/space")

    const response = await dispatcher.dispatch(request, context)

    expect(<APIGatewayProxyResult>response).toStrictEqual({
      statusCode: 404,
      body: "Not Found",
    })
  })

  it("supports wildcard matching", async () => {
    const wildcardDispatcher = new RequestDispatcher({
      "/hello": returnHello,
      "*": returnWorld,
    })
    const request = getAPIGatewayProxyEvent("GET", "/outer/space")

    const response = await wildcardDispatcher.dispatch(request, context)

    const expectedResponse = await returnWorld.handle(request, context)
    expect(response).toStrictEqual(expectedResponse)
  })

  it("forwards the path without the matching start", async () => {
    const request = getAPIGatewayProxyEvent("GET", "/get/this/path")

    const response = await dispatcher.dispatch(request, context)

    expect(response).toStrictEqual({
      body: "/this/path",
      statusCode: 200,
    })
  })
})
