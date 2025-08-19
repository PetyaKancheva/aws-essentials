#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { JsonServiceAppStack } from '../lib/json-service-app-stack';
const env = {
    account:  process.env.CDK_DEFAULT_ACCOUNT,
    region:   "eu-central-1",
};
const stackProps = {
    email: process.env.SUBSCRIPTION_EMAIL || "test@mail.com",
};
const app = new cdk.App();
new JsonServiceAppStack(app, 'JsonServiceAppStack', {
    ...stackProps,
    env
});