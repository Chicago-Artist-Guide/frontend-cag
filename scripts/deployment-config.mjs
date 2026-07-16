/* eslint-env node */

import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const DEPLOYMENT_CONFIGURATION_NAMES = Object.freeze([
  'AWS_ACCOUNT_ID',
  'AWS_REGION',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_SENDER_ID',
  'NEXT_PUBLIC_LGL_API_KEY'
]);

const readDeploymentConfiguration = (environment) => {
  const entries = DEPLOYMENT_CONFIGURATION_NAMES.map((name) => [
    name,
    environment[name] ?? ''
  ]);
  const missing = entries
    .filter(([, value]) => !value.trim())
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing required deployment configuration: ${missing.join(', ')}`
    );
  }

  return entries;
};

export const fingerprintDeploymentConfiguration = (environment) =>
  createHash('sha256')
    .update(JSON.stringify(readDeploymentConfiguration(environment)))
    .digest('hex');

export const runDeploymentConfigCli = ({
  environment = process.env,
  writeError = console.error,
  writeOutput = console.log
} = {}) => {
  try {
    writeOutput(
      `configuration_fingerprint=${fingerprintDeploymentConfiguration(environment)}`
    );
    return 0;
  } catch (error) {
    writeError(error instanceof Error ? error.message : String(error));
    return 1;
  }
};

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  process.exitCode = runDeploymentConfigCli();
}
