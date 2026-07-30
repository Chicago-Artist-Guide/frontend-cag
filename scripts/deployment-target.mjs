/* eslint-env node */

import { pathToFileURL } from 'node:url';

const PREVIEW_ID_PATTERN =
  /^(?=.{3,20}$)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_PREVIEW_IDS = new Set(['preview', 'production', 'staging']);
const SUPPORTED_OPERATIONS = new Set(['deploy', 'destroy']);

const assertSingleLine = (value, label) => {
  const stringValue = String(value);

  if (/[\r\n]/.test(stringValue)) {
    throw new Error(`${label} must be single-line`);
  }

  return stringValue;
};

export const validatePreviewId = (previewId) => {
  if (
    typeof previewId !== 'string' ||
    !PREVIEW_ID_PATTERN.test(previewId) ||
    RESERVED_PREVIEW_IDS.has(previewId)
  ) {
    throw new Error(
      'Preview ID must be a non-reserved lowercase slug of 3 to 20 characters using single hyphens between letter or number groups'
    );
  }

  return previewId;
};

export const isValidCagStackName = (stackName) => {
  if (stackName === 'CagPlatform-staging') {
    return true;
  }
  if (stackName === 'CagPlatform-production') {
    return true;
  }
  if (typeof stackName !== 'string') {
    return false;
  }

  const prefix = 'CagPlatform-preview-';
  if (!stackName.startsWith(prefix)) {
    return false;
  }

  try {
    validatePreviewId(stackName.slice(prefix.length));
    return true;
  } catch {
    return false;
  }
};

export const resolveWorkflowTarget = ({
  confirmation,
  operation = 'deploy',
  previewId,
  ref,
  refType,
  stage
} = {}) => {
  if (!SUPPORTED_OPERATIONS.has(operation)) {
    throw new Error(`Unsupported operation: ${String(operation)}`);
  }

  let target;

  if (stage === 'staging') {
    if (refType !== undefined && refType !== 'branch') {
      throw new Error('Staging deployment must run from a branch');
    }
    if (ref !== 'staging') {
      throw new Error('Staging deployment must run from ref staging');
    }

    target = {
      cdkStage: 'staging',
      deployEnvironment: 'staging',
      deploymentId: 'staging',
      isEphemeral: false,
      planEnvironment: 'staging-plan',
      stackName: 'CagPlatform-staging',
      stageName: 'staging'
    };
  } else if (stage === 'production') {
    if (refType !== undefined && refType !== 'branch') {
      throw new Error('Production deployment must run from a branch');
    }
    if (ref !== 'master') {
      throw new Error('Production deployment must run from ref master');
    }

    target = {
      cdkStage: 'production',
      deployEnvironment: 'production',
      deploymentId: 'production',
      isEphemeral: false,
      planEnvironment: 'production-plan',
      stackName: 'CagPlatform-production',
      stageName: 'production'
    };
  } else if (stage === 'preview') {
    const safePreviewId = validatePreviewId(previewId);

    target = {
      cdkStage: 'preview',
      deployEnvironment: 'preview',
      deploymentId: `preview-${safePreviewId}`,
      isEphemeral: true,
      planEnvironment: 'preview-plan',
      stackName: `CagPlatform-preview-${safePreviewId}`,
      stageName: 'preview'
    };
  } else {
    throw new Error(`Unsupported deployment stage: ${String(stage)}`);
  }

  if (operation === 'destroy') {
    if (!target.isEphemeral) {
      throw new Error('Only preview targets may be destroyed');
    }
    if (confirmation !== target.stackName) {
      throw new Error(
        `Destroy confirmation must exactly equal ${target.stackName}`
      );
    }
  }

  return target;
};

const toSnakeCase = (key) =>
  key.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);

export const formatGitHubOutputs = (values) => {
  const entries =
    'stageName' in values
      ? [
          ['stage_name', values.stageName],
          ['cdk_stage', values.cdkStage],
          ['deployment_id', values.deploymentId],
          ['stack_name', values.stackName],
          ['plan_environment', values.planEnvironment],
          ['deploy_environment', values.deployEnvironment],
          ['is_ephemeral', values.isEphemeral]
        ]
      : Object.entries(values).map(([key, value]) => [toSnakeCase(key), value]);

  return entries
    .map(([key, value]) => {
      if (!/^[a-z_][a-z0-9_]*$/.test(key)) {
        throw new Error(`Invalid GitHub output name: ${key}`);
      }

      return `${key}=${assertSingleLine(value, 'GitHub output values')}`;
    })
    .join('\n');
};

const parseArguments = (argumentsList) => {
  const supported = new Set([
    '--confirmation',
    '--operation',
    '--preview-id',
    '--ref',
    '--ref-type',
    '--stage'
  ]);
  const parsed = {};

  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index];
    const value = argumentsList[index + 1];

    if (!supported.has(key) || value === undefined || value.startsWith('--')) {
      throw new Error(`Invalid deployment target arguments near ${String(key)}`);
    }
    if (Object.hasOwn(parsed, key)) {
      throw new Error(`Duplicate deployment target argument: ${key}`);
    }

    parsed[key] = value;
  }

  return parsed;
};

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  try {
    const argumentsByName = parseArguments(process.argv.slice(2));
    const target = resolveWorkflowTarget({
      confirmation:
        argumentsByName['--confirmation'] ?? process.env.DESTROY_CONFIRMATION,
      operation:
        argumentsByName['--operation'] ??
        process.env.DEPLOYMENT_OPERATION ??
        'deploy',
      previewId: argumentsByName['--preview-id'] ?? process.env.PREVIEW_ID,
      ref: argumentsByName['--ref'] ?? process.env.GITHUB_REF_NAME,
      refType: argumentsByName['--ref-type'] ?? process.env.GITHUB_REF_TYPE,
      stage: argumentsByName['--stage'] ?? process.env.DEPLOYMENT_STAGE
    });

    console.log(formatGitHubOutputs(target));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Deployment target validation failed: ${message}`);
    process.exitCode = 1;
  }
}
