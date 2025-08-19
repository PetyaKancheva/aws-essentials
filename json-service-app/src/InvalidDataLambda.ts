import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import { SNSEvent} from "aws-lambda"
import {randomUUID} from "crypto";

const ddb = new DynamoDBClient;

export const handler = async (event: SNSEvent) => {

    const tableName = process.env.TABLE_NAME;
    const record = event.Records;


    const body = JSON.stringify(record[0].Sns.Message);
    console.log(`Processed message ${body}`);


    // put data in table

    const uuid = randomUUID();
    const now = new Date();

    const timestamp = now.toISOString();

    // calculate deletion time

    //  delete by 10
    var minutes = (Math.floor(now.getMinutes() / 10) * 10); //+ 20 min for testing
    //  for test add 4 min
    minutes += 4;
    const hour = now.getHours();
    //  add 1 day for normal
    const date = now.getDate();

    const deletionTime = `${date} / ${hour} :${minutes}`;


    const dynamoDBCommand = new PutItemCommand({
            TableName: tableName,
            Item: {
                PK: {
                    S: `ITEM#${uuid}`
                },
                SK: {
                    S: `METADATA#${uuid}`
                },
                timestamp: {
                    S: timestamp
                },
                body: {
                    S: body
                },
                deletionTime: {
                    S: deletionTime
                }
            },
        }
    );

    await ddb.send(dynamoDBCommand);


}

    
 