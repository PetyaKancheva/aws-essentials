import {App} from "aws-cdk-lib";
import {Template} from "aws-cdk-lib/assertions";
import {FavouriteCatAppStack} from "../lib/favourite-cat-app-stack";


test('Snapshot Test', () => {
    const app = new App();
    const stack = new  FavouriteCatAppStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    expect(template).toMatchSnapshot();
});
