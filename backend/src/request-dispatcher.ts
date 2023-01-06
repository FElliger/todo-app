import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { getTodoHandler, ResourceHandler } from "./handler"

export type ResourceConfig = {
  [key: string]: ResourceHandler
}

export class RequestDispatcher {
  constructor(private readonly config: ResourceConfig) {}

  async dispatch(request: APIGatewayProxyEvent, context: Context): Promise<void | APIGatewayProxyResult> {
    const path = request.path

    for (const key in this.config) {
      if (path.startsWith(key)) {
        const updatedRequest = {
          ...request,
          path: path.substring(key.length),
        }
        return this.config[key].handle(updatedRequest, context)
      } else if (key === "*") {
        return this.config[key].handle(request, context)
      }
    }

    // if we reach this point, no path matched
    return {
      statusCode: 404,
      body: "Not Found",
    }
  }

  static getDefault() {
    const routes = {
      "/todos": getTodoHandler(),
    }

    return new RequestDispatcher(routes)
  }
}
