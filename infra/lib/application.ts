import { type App } from 'aws-cdk-lib';
import {
  PlatformStack,
  PUBLIC_BUILD_ARGUMENT_NAMES,
  type PublicBuildArguments
} from './platform-stack.js';
import { resolveRequestedDeploymentTargets } from './deployment-target.js';

export const readPublicBuildArguments = (
  environment: NodeJS.ProcessEnv
): PublicBuildArguments =>
  Object.fromEntries(
    PUBLIC_BUILD_ARGUMENT_NAMES.map((name) => [name, environment[name] ?? ''])
  ) as PublicBuildArguments;

export const configurePlatformApp = (
  app: App,
  buildArguments: PublicBuildArguments
): PlatformStack[] => {
  const targets = resolveRequestedDeploymentTargets(
    app.node.tryGetContext('stage'),
    app.node.tryGetContext('previewId')
  );

  return targets.map(
    (target) =>
      new PlatformStack(app, target.stackName, {
        buildArguments,
        description: `Chicago Artist Guide ${target.deploymentId} container platform`,
        target
      })
  );
};
