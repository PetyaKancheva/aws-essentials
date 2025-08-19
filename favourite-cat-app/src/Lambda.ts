import {APIGatewayEvent} from "aws-lambda";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

const snsClient= new SNSClient();
const ddb= new DynamoDBClient();

export const handler = async (event:  APIGatewayEvent) => {
        const topicArn= process.env.TOPIC_ARN;
        const tableName=process.env.TABLE_NAME;

    const {catId,savedUrl}= JSON.parse(event.body!);
        console.log(event.body);
        console.log(`catid: ${catId}, savedUrl: ${savedUrl}`);


// put in table to override current favouriteCat
    await ddb.send( new PutItemCommand({
        TableName: tableName,
        Item: {
            PK: {
                S: `FAVOURITE_CAT`
            },
            catId: {
                S: catId
            },
            savedUrl: {
                S: savedUrl
            },
        }
        } ));


    // send notification to Lydia
    await snsClient.send(new PublishCommand({
        Subject:"New Favourite cat",
        Message: `Link to image: ${savedUrl}`,
        TopicArn: topicArn,
    }));
        console.log("message sent");

    return {
        statusCode: 200,
    }
}