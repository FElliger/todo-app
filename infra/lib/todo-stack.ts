import { Duration, Stack, StackProps } from "aws-cdk-lib"
import { EndpointType, LambdaRestApi } from "aws-cdk-lib/aws-apigateway"
import {
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  Distribution,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront"
import { RestApiOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins"
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb"
import { PolicyStatement } from "aws-cdk-lib/aws-iam"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { RetentionDays } from "aws-cdk-lib/aws-logs"
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3"
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment"
import { Construct } from "constructs"

export class ToDoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const table = new Table(this, "DataStore", {
      tableName: "todo-data",
      partitionKey: {
        name: "username",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "todoId",
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: "timeToLive",
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    const apiHandler = new NodejsFunction(this, "ToDoApiHandler", {
      entry: "../backend/src/request-handler.ts",
      handler: "handleRequest",
      timeout: Duration.seconds(10),
      logRetention: RetentionDays.ONE_WEEK,
    })

    apiHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:Query", "dynamodb:PutItem", "dynamodb:UpdateItem"],
        resources: [table.tableArn],
      })
    )

    const restAPI = new LambdaRestApi(this, "ToDoApi", {
      handler: apiHandler,
      endpointTypes: [EndpointType.REGIONAL],
    })

    const bucket = new Bucket(this, "WebsiteBucket", {
      bucketName: `todo-app-website-${this.account}`,
      encryption: BucketEncryption.S3_MANAGED,
    })

    new BucketDeployment(this, "WebsiteDeployment", {
      destinationBucket: bucket,
      sources: [Source.asset("../frontend/dist")],
    })

    new Distribution(this, "CloudfrontDistribution", {
      defaultBehavior: {
        origin: new S3Origin(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new RestApiOrigin(restAPI),
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
      },
    })
  }
}
