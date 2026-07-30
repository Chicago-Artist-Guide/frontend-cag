#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import {
  configurePlatformApp,
  readPublicBuildArguments
} from '../lib/application.js';

const app = new App();

configurePlatformApp(app, readPublicBuildArguments(process.env));
