import { type App, DefaultStackSynthesizer } from 'aws-cdk-lib';
import {
  PlatformStack,
  PUBLIC_BUILD_ARGUMENT_NAMES,
  type PublicBuildArguments,
  type PlatformStackProps
} from './platform-stack.js';
import {
  ManagedDnsStack,
  managedZoneId,
  MANAGED_DOMAINS,
  readManagedDnsConfiguration
} from './managed-dns.js';
import { resolveRequestedDeploymentTargets } from './deployment-target.js';

export const readPublicBuildArguments = (
  environment: NodeJS.ProcessEnv
): PublicBuildArguments =>
  ({
    ...Object.fromEntries(
      PUBLIC_BUILD_ARGUMENT_NAMES.map((name) => [name, environment[name] ?? ''])
    ),
    NEXT_PUBLIC_SITE_URL:
      environment.NEXT_PUBLIC_SITE_URL || 'https://www.chicagoartistguide.org'
  }) as PublicBuildArguments;
export const configurePlatformApp = (
  app: App,
  buildArguments: PublicBuildArguments
): PlatformStack[] => {
  const targets = resolveRequestedDeploymentTargets(
    app.node.tryGetContext('stage'),
    app.node.tryGetContext('previewId')
  );

  const managedDns = readManagedDnsConfiguration(process.env);
  if (
    managedDns.enabled &&
    targets.some(
      (target) =>
        target.stageName !== 'production' && target.stageName !== 'canary'
    )
  ) {
    throw new Error(
      'Managed DNS requires an explicit production or canary target'
    );
  }
  const dnsStack =
    managedDns.enabled && targets.some((target) => target.isProduction)
      ? new ManagedDnsStack(app)
      : undefined;

  return targets.map((target) => {
    const stackProps: PlatformStackProps = {
      buildArguments,
      description: `Chicago Artist Guide ${target.deploymentId} container platform`,
      synthesizer: new DefaultStackSynthesizer({
        qualifier: target.isProduction ? 'cagprod' : 'cagcanary'
      }),
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

    if (
      managedDns.enabled &&
      (target.stageName === 'production' || target.stageName === 'canary')
    ) {
      stackProps.managedDomain = {
        domainName: MANAGED_DOMAINS[target.stageName],
        hostedZoneId: managedZoneId(target.stageName),
        https: managedDns.https
      };
    }
    const stack = new PlatformStack(app, target.stackName, stackProps);
    if (dnsStack) stack.addDependency(dnsStack);
    return stack;
  });
};
