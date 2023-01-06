import { RequestHandler } from "../src/request-handler"
import { RequestDispatcher } from "../src/request-dispatcher"
import { getAPIGatewayProxyEvent, getContext } from "./test-object-factory"

describe("RequestHandler", () => {
  let requestHandler: RequestHandler
  const dispatcher: RequestDispatcher = new RequestDispatcher({})
  const context = getContext()

  beforeEach(() => {
    requestHandler = new RequestHandler(dispatcher)
  })

  it("should return the dispatcher's result", async () => {
    const request = getAPIGatewayProxyEvent("GET", "/some/path")

    const response = await requestHandler.handleRequest(request, context)

    const expectedResponse = await dispatcher.dispatch(request, context)
    expect(response).toStrictEqual(expectedResponse)
  })
})
