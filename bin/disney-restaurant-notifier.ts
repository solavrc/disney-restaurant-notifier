#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { DisneyRestaurantNotifierStack } from '../lib/disney-restaurant-notifier-stack'

const app = new cdk.App()
new DisneyRestaurantNotifierStack(app, 'DisneyRestaurantNotifierStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
