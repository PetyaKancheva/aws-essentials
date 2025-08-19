import {Stack, StackProps} from 'aws-cdk-lib';
import {LambdaIntegration, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {AttributeType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Subscription, SubscriptionProtocol, Topic} from 'aws-cdk-lib/aws-sns';
import {LambdaSubscription} from 'aws-cdk-lib/aws-sns-subscriptions';
import {Construct} from 'constructs';
import {BaseFunction, BaseTopic, EmailSubscription} from "./functions";
import {Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {Rule, Schedule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";
import {EventBridgeSchedulerTarget} from "aws-cdk-lib/aws-stepfunctions-tasks";


interface JsonServiceAppStackProps extends StackProps {
    email: string,
}

export class JsonServiceAppStack extends Stack {
    constructor(scope: Construct, id: string, props?: JsonServiceAppStackProps) {
        super(scope, id, props);

        // table
        const table = new Table(this, "SisiTable", {
            partitionKey: {
                name: "PK",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "SK",
                type: AttributeType.STRING
            }
        });

        const indexName = "deletion-index";
        table.addGlobalSecondaryIndex({
            indexName: indexName,
            partitionKey: {
                name: 'deletionTime', type: AttributeType.STRING
            },
        });

        // SNS for valid data
        const validDataTopic = new BaseTopic(this, "ValidDataTopic",{});
        new EmailSubscription(this, "ValidDataSubscription", {
            topic: validDataTopic,
            endpoint: props!.email,
        });
        // SNS for informing invalid datalambda
        const invalidDataTopic = new BaseTopic(this, "InvalidDataTopic",{});

        // SNS for deletion of item
        const deletionDataTopic = new BaseTopic(this, "DeletionDataTopic",{});
        new EmailSubscription(this, "DeletionDataSubscription", {
            topic: deletionDataTopic,
            endpoint: props!.email
        });

        // lambda for validation
        const validationLambda = new BaseFunction(this, "ValidationLambda", {
            environment: {
                VALID_TOPIC_ARN: validDataTopic.topicArn,
                INVALID_TOPIC_ARN: invalidDataTopic.topicArn,
            }
        });
        // grant permission to lambda
        validDataTopic.grantPublish(validationLambda);
        invalidDataTopic.grantPublish(validationLambda);

        // lambad to delete the item after 24hrs
        const deletionLambda = new BaseFunction(this, "DeletionLambda", {
            environment: {
                TABLE_NAME: table.tableName,
                DELETION_TOPIC_ARN: deletionDataTopic.topicArn,
                INDEX_NAME: indexName,
            }
        });

        // lambda for invalid JSON -  put in table and crate schedule for deletion

        const invalidDataLambda = new BaseFunction(this, "InvalidDataLambda", {
            environment: {
                TABLE_NAME: table.tableName,
            }
        });


        // grant permission to publish topic
        deletionDataTopic.grantPublish(deletionLambda);
        //  create rule to check expiration date every 10 min
        const rule = new Rule(this, 'ScheduleItemDeletionRule', {
            schedule: Schedule.cron({minute: '*/10'}),
        });

        rule.addTarget(new LambdaFunction(deletionLambda));

        // create role for the AWS service
        const role = new Role(this, 'EventsRole', {
            assumedBy: new ServicePrincipal('events.amazonaws.com'),
        });
        new EventBridgeSchedulerTarget({
            arn: deletionLambda.functionArn,
            role: role
        });

        invalidDataTopic.addSubscription(new LambdaSubscription(invalidDataLambda));

        // grant permission to lambda for table
        table.grantWriteData(invalidDataLambda);
        table.grantReadWriteData(deletionLambda);

        // API with resource and  post method
        const sisiApi = new RestApi(this, "SisiApi", {
            restApiName: "SisiApi"
        });
        // resource
        const postResource = sisiApi.root.addResource("order");
        // method post
        postResource.addMethod('POST', new LambdaIntegration(validationLambda,
            {proxy: true}
        ))

    }
}
