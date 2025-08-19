import {PublishCommand, SNSClient, ThrottledException} from "@aws-sdk/client-sns";
import {APIGatewayProxyEvent} from "aws-lambda"

const snsClient = new SNSClient;

export const handler = async (event: APIGatewayProxyEvent) => {

    console.log(JSON.stringify(event));
    // Valid JSON:
    // {
    //     "valid": true,
    //     "value": 12,
    //     "description": "5W40 motor oil",
    //     "buyer": "Hristo"
    // }
    // Invalid JSON:
    // {
    //     "valid": false,
    //     "value": 0,
    //     "description": "Hacker attack",
    //     "buyer": "Nobody"
    // }
    const validDataTopicARN = process.env.VALID_TOPIC_ARN;
    const invalidDataTopicARN = process.env.INVALID_TOPIC_ARN;

    // value,description,buyer
    const {valid} = JSON.parse(event.body!);

    if (valid) {
        // send notification with object to email

        await snsClient.send(new PublishCommand({
            Subject: `Notification for new order`,
            Message: JSON.stringify(event.body),
            TopicArn: validDataTopicARN,
        }));

        console.log('Valid JSON sent')
    } else {

        // send notification with object invalidDatalambda + timestamp
        await snsClient.send(new PublishCommand({
            Message: JSON.stringify(event.body),
            TopicArn: invalidDataTopicARN,
        }));
        console.log('Invalid JSON sent')
    }
    ;


    return {
        statusCode: 200,
    }
}