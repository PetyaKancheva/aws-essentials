import { App } from "aws-cdk-lib";
import { FavouriteCatAppStack } from '../lib/favourite-cat-app-stack';
const env = {
    account:  process.env.CDK_DEFAULT_ACCOUNT,
    region:   "eu-central-1",
};
const stackProps = {
    email: process.env.SUBSCRIPTION_EMAIL || "test@mail.com",
};
const app = new App();
new FavouriteCatAppStack(app, 'FavouriteCatAppStack', {
        ...stackProps,
        env
})