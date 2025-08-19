import {Construct} from 'constructs';
import {CfnOutput, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Bucket} from 'aws-cdk-lib/aws-s3';
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import * as path from "node:path";
import {Subscription, SubscriptionProtocol, Topic} from "aws-cdk-lib/aws-sns";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {Cors, LambdaIntegration, RestApi,} from "aws-cdk-lib/aws-apigateway";
import {BaseFunction} from "./functions";



interface FavouriteCatAppStackProps extends StackProps{
    email: string ,
}

export class FavouriteCatAppStack extends  Stack {
    constructor(scope: Construct, id: string, props?:   FavouriteCatAppStackProps) {
        super(scope, id, props!);


        // bucket with static website
        const bucket  = new Bucket(this, "CatBucket",{
            websiteIndexDocument: "index.html",
            publicReadAccess: true,
            blockPublicAccess: {
                blockPublicPolicy: false,
                blockPublicAcls: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
            },
            removalPolicy: RemovalPolicy.DESTROY
        });

        // deploy bucket
        const deployment = new BucketDeployment(this, 'DeployFiles', {
            sources: [Source.asset(path.join(__dirname,"../website-folder"))],
            destinationBucket: bucket,
        });

// table to store the favourite cat


        const table = new Table(this, "LydiaTable", {
            partitionKey: {
                name: "PK",
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST
        });

        // topic for favourite cat // give permission
        const topic = new Topic(this,"CatTopic", {
            topicName:"CatTopic",
        })


        new Subscription(this,"Subscription",{
                topic: topic,
                endpoint: props!.email,
                protocol: SubscriptionProtocol.EMAIL
            }
        );
        // lambda for API interaction

        const lambda=  new BaseFunction(this,"Lambda",{
            environment:{
                TOPIC_ARN:topic.topicArn,
                TABLE_NAME:table.tableName,
            }
        });

        // grant  right to Put in table
        table.grantReadWriteData(lambda);
        // grant right to publish
        topic.grantPublish(lambda);


        // API post to resource /saveCat

        const api =new RestApi(this,"lydiaAPI");
        const resource= api.root.addResource("saveCat");
        resource.addMethod("POST",new LambdaIntegration(lambda,{proxy: true}));

        // allow website to get images of cats from caatas.com

        resource.addCorsPreflight( {allowOrigins: Cors.ALL_ORIGINS ,
            allowMethods:Cors.ALL_METHODS,});
        // can be made more specific
        // resource.addCorsPreflight( {allowOrigins: ["https://cataas.com/cat/*"] ,
        //   allowMethods: ["GET"],});

        // return website url
        new CfnOutput(this,"WebsiteURL",{
            value: bucket.bucketWebsiteDomainName,
            exportName:"WebsiteURL"
        });

    }
}
