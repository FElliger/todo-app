import { Duration, Stack, StackProps } from "aws-cdk-lib"
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"

export class ToDoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const apiHandler = new NodejsFunction(this, "ToDoApiHandler", {
      entry: "../backend/src/requestHandler.ts",
      handler: "handleRequest",
      timeout: Duration.seconds(10),
    })

    new LambdaRestApi(this, "ToDoApi", {
      handler: apiHandler,
    })
  }
}
