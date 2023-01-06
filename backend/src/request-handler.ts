import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { RequestDispatcher } from "./request-dispatcher"

export class RequestHandler {
  constructor(private readonly dispatcher: RequestDispatcher) {}

  async handleRequest(event: APIGatewayProxyEvent, context: Context): Promise<void | APIGatewayProxyResult> {
    return this.dispatcher.dispatch(event, context)
  }
}

const requestHandler = new RequestHandler(RequestDispatcher.getDefault())

export async function handleRequest(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<void | APIGatewayProxyResult> {
  return requestHandler.handleRequest(event, context)
}
