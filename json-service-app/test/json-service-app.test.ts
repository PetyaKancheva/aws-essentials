import {App} from "aws-cdk-lib";
import {Template} from "aws-cdk-lib/assertions";
import {JsonServiceAppStack} from "../lib/json-service-app-stack";

test('Snapshot Test', () => {
    const app = new App();
    const stack = new  JsonServiceAppStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    expect(template).toMatchSnapshot();
});
