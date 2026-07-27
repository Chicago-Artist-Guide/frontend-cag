import { type App } from 'aws-cdk-lib';
import {
  PlatformStack,
  PUBLIC_BUILD_ARGUMENT_NAMES,
  type PublicBuildArguments,
  type PlatformStackProps
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

  return targets.map((target) => {
    const stackProps: PlatformStackProps = {
      buildArguments,
      description: `Chicago Artist Guide ${target.deploymentId} container platform`,
      target
    };

    if (target.isProduction) {
      stackProps.cpu = 512;
      stackProps.memoryLimitMiB = 1024;
    }

    if (target.isProduction && process.env.CERTIFICATE_ARN) {
      stackProps.certificateArn = process.env.CERTIFICATE_ARN;
    }

    if (target.isProduction && process.env.WEB_ACL_ARN) {
      stackProps.webAclArn = process.env.WEB_ACL_ARN;
    }

    if (target.isProduction && process.env.FLOW_LOGS === 'true') {
      stackProps.flowLogs = true;
    }

    return new PlatformStack(app, target.stackName, stackProps);
  });
};
