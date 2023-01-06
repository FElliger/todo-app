import express, { Express, Request, Response } from "express"
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { RequestHandler } from "./src/request-handler"
import { RequestDispatcher } from "./src/request-dispatcher"

const app: Express = express()
const port = 3000
const basePath = "/prod"
const requestHandler = new RequestHandler(RequestDispatcher.getDefault())

//eslint-disable-next-line @typescript-eslint/ban-types
app.use("/*", (req: Request, res: Response, next: Function) => {
  console.log(`${Date.now()} ${req.method} ${req.originalUrl}`)
  next()
})

app.use(express.text({ type: "*/*" }))

app.all(`${basePath}/*`, async (req: Request, res: Response) => {
  const { event, context } = mapRequest(req)

  const apiGatewayResponse = await requestHandler.handleRequest(event, context)

  if (apiGatewayResponse) {
    sendResponse(<APIGatewayProxyResult>apiGatewayResponse, res)
  } else {
    res.send()
  }
})

app.listen(port, () => {
  console.log(`Dev server started on localhost:${port}`)
})

type APIGatewayRequestObjects = {
  event: APIGatewayProxyEvent
  context: Context
}

function mapRequest(request: Request): APIGatewayRequestObjects {
  const context = {} as unknown as Context
  const event = {
    body: request.body,
    httpMethod: request.method,
    path: request.originalUrl.replace(basePath, ""),
  } as unknown as APIGatewayProxyEvent

  return { event, context }
}

function sendResponse(apiResult: APIGatewayProxyResult, response: Response): void {
  response.status(response.statusCode).send(apiResult.body)
}
