import {
  CfnOutput,
  DefaultStackSynthesizer,
  Fn,
  RemovalPolicy,
  Stack
} from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

export const DNS_STACK_NAME = 'CagPlatform-production-dns';
export const MANAGED_DOMAINS = {
  production: 'prod.chicagoartistguide.org',
  canary: 'staging.chicagoartistguide.org'
} as const;
export type ManagedStage = keyof typeof MANAGED_DOMAINS;

export const readManagedDnsConfiguration = (environment: NodeJS.ProcessEnv) => {
  const flag = (name: string) => {
    const value = environment[name];
    if (value && value !== 'true' && value !== 'false') {
      throw new Error(`${name} must be true or false`);
    }
    return value === 'true';
  };
  const enabled = flag('MANAGED_DNS');
  const https = flag('MANAGED_HTTPS');
  if (https && !enabled) {
    throw new Error('MANAGED_HTTPS requires MANAGED_DNS');
  }
  if (enabled && environment.CERTIFICATE_ARN) {
    throw new Error('MANAGED_DNS cannot be combined with CERTIFICATE_ARN');
  }
  return { enabled, https };
};

export const managedZoneId = (stage: ManagedStage) =>
  Fn.importValue(`${DNS_STACK_NAME}:${stage}:ZoneId`);

// Keep DNS independent of the destroyable canary application stack. These
// exact exported IDs avoid selecting a same-name zone that is not delegated.
export class ManagedDnsStack extends Stack {
  constructor(scope: Construct) {
    super(scope, DNS_STACK_NAME, {
      description: 'Persistent delegated CAG production and staging subdomains',
      synthesizer: new DefaultStackSynthesizer({ qualifier: 'cagprod' }),
      terminationProtection: true
    });
    for (const stage of Object.keys(MANAGED_DOMAINS) as ManagedStage[]) {
      const zone = new route53.PublicHostedZone(this, `${stage}Zone`, {
        zoneName: MANAGED_DOMAINS[stage]
      });
      zone.applyRemovalPolicy(RemovalPolicy.RETAIN);
      new CfnOutput(this, `${stage}ZoneId`, {
        exportName: `${DNS_STACK_NAME}:${stage}:ZoneId`,
        value: zone.hostedZoneId
      });
      const nameServers = zone.hostedZoneNameServers;
      if (!nameServers)
        throw new Error('Public hosted zones must expose nameservers');
      new CfnOutput(this, `${stage}NameServers`, {
        description: `Delegate ${MANAGED_DOMAINS[stage]} from the parent DNS provider using these NS records.`,
        value: Fn.join(', ', nameServers)
      });
    }
  }
}
