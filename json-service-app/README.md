## Sisi's JSON object service

Sisi wants a service that processes JSON objects through a public endpoint where the JSON can be sent using curl or Postman.
If the JSON is valid, the object shall be sent to her via email, else the element should be added to a DynamoDB table.
The table item should be deleted after 24hrs and Sisi informed via email.

### AWS services

- dynamoDB table
- SNS topic and subscription
- multiple lambda functions
- custom Function, Subscription, Topic
- scheduled event
- API Gateway

### Other implementations

- Snapshot test
- CI/CD pipeline with GIT Actions

### Cost Estimation
