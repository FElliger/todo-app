import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"

export interface ResourceHandler {
  handle(event: APIGatewayProxyEvent, context: Context): Promise<void | APIGatewayProxyResult>
}
