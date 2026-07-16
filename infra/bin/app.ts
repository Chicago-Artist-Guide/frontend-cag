#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { PlatformStack } from '../lib/platform-stack.js';

const app = new App();

new PlatformStack(app, 'CagPlatformStaging', {
  description: 'Chicago Artist Guide staging container platform (DEV-513)',
  stageName: 'staging'
});

new PlatformStack(app, 'CagPlatformProduction', {
  description: 'Chicago Artist Guide production container platform (DEV-513)',
  stageName: 'production'
});
