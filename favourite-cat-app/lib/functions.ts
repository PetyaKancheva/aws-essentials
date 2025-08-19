import { Runtime } from "aws-cdk-lib/aws-lambda"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import {Duration} from "aws-cdk-lib";

interface BaseFunctionProps {
    environment: {
        // add more custom fields as project grows
        TOPIC_ARN?:string,
        TABLE_NAME?:string,
    }
}

export class BaseFunction extends NodejsFunction {

    constructor(scope: Construct, id: string, props: BaseFunctionProps) {
        super(scope, id, {
            ...props,
            runtime:Runtime.NODEJS_20_X,
            handler: "handler",
            timeout: Duration.seconds(5),
            entry: `${__dirname}/../src/${id}.ts`,

        })
    }}