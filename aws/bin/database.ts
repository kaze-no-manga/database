#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { PROJECT_NAME } from '../lib/constants.js';
import { KazeNoMangaDatabaseStack } from '../lib/database-stack.js';

const app = new App();

const stackName = `${PROJECT_NAME}Database`;

new KazeNoMangaDatabaseStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName,
});
