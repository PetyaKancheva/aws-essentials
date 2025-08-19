import {Duration} from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {Construct} from "constructs";
import {Topic, ITopic, Subscription, SubscriptionProtocol, TopicProps} from "aws-cdk-lib/aws-sns";


interface BaseFunctionProps {
    environment: {
        VALID_TOPIC_ARN?: string,
        INVALID_TOPIC_ARN?: string,
        TABLE_NAME?:string,
        DELETION_TOPIC_ARN?:string,
        INDEX_NAME?:string
    }
}
interface  EmailSubscriptionProps{
    endpoint: string,
    topic: ITopic,
}

export class BaseFunction extends NodejsFunction {

    constructor(scope: Construct, id: string, props: BaseFunctionProps) {
        super(scope, id, {
            ...props,
            runtime: Runtime.NODEJS_20_X,
            handler: "handler",
            timeout: Duration.seconds(5),
            entry: `${__dirname}/../src/${id}.ts`,

        })
    }}

export class EmailSubscription extends  Subscription{
    constructor(scope: Construct ,id: string, props:  EmailSubscriptionProps) {
        super(scope, id,{
            ...props,
            protocol: SubscriptionProtocol.EMAIL,
            })
    }}
export class BaseTopic extends Topic{
    constructor(scope: Construct ,id: string, props: TopicProps ){
        super(scope,id,{
            topicName: `${id}`,
        })
    }
}