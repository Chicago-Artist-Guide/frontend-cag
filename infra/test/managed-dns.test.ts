import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { configurePlatformApp } from '../lib/application.js';
import { createTestApp } from './test-app.js';

const buildArguments = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'key',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'app',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'measurement',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'project',
  NEXT_PUBLIC_FIREBASE_SENDER_ID: 'sender',
  NEXT_PUBLIC_LGL_API_KEY: 'lgl'
};
const configure = (stage = 'production') => {
  const app = createTestApp({ context: { stage } });
  const [stack] = configurePlatformApp(app, buildArguments);
  return { app, stack, template: Template.fromStack(stack) };
};
afterEach(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.stubEnv('MANAGED_DNS', 'true');
  vi.stubEnv('MANAGED_HTTPS', 'false');
  vi.stubEnv('CERTIFICATE_ARN', '');
});

describe('managed subdomain delivery', () => {
  it('creates protected retained child zones only in the production DNS stack', () => {
    const { app, stack, template } = configure();
    const dns = app.node.findChild('CagPlatform-production-dns') as Stack;
    expect(dns.terminationProtection).toBe(true);
    expect(stack.dependencies).toContain(dns);
    const zones = Object.values(
      Template.fromStack(dns).findResources('AWS::Route53::HostedZone')
    );
    expect(zones).toHaveLength(2);
    expect(zones.map((zone) => zone.Properties.Name).sort()).toEqual([
      'prod.chicagoartistguide.org.',
      'staging.chicagoartistguide.org.'
    ]);
    for (const zone of zones) {
      expect(zone.DeletionPolicy).toBe('Retain');
      expect(zone.UpdateReplacePolicy).toBe('Retain');
    }
    template.resourceCountIs('AWS::Route53::HostedZone', 0);
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'prod.chicagoartistguide.org.',
      Type: 'A',
      HostedZoneId: {
        'Fn::ImportValue': 'CagPlatform-production-dns:production:ZoneId'
      },
      AliasTarget: Match.anyValue()
    });
    template.resourceCountIs('AWS::CertificateManager::Certificate', 0);
    template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 1);
  });
  it('imports the persistent staging zone without creating a zone on canary', () => {
    const { app, template } = configure('canary');
    expect(app.node.tryFindChild('CagPlatform-production-dns')).toBeUndefined();
    template.resourceCountIs('AWS::Route53::HostedZone', 0);
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'staging.chicagoartistguide.org.',
      Type: 'A',
      HostedZoneId: {
        'Fn::ImportValue': 'CagPlatform-production-dns:canary:ZoneId'
      }
    });
  });
  it.each([
    ['production', 'prod.chicagoartistguide.org'],
    ['canary', 'staging.chicagoartistguide.org']
  ])(
    'creates native validated TLS and the actual application URL for %s',
    (stage, domain) => {
      vi.stubEnv('MANAGED_HTTPS', 'true');
      const { template } = configure(stage);
      template.hasResourceProperties('AWS::CertificateManager::Certificate', {
        DomainName: domain,
        ValidationMethod: 'DNS',
        Tags: Match.arrayWith([
          { Key: 'DeploymentId', Value: stage },
          { Key: 'Environment', Value: stage }
        ]),
        DomainValidationOptions: [
          {
            DomainName: domain,
            HostedZoneId: {
              'Fn::ImportValue': `CagPlatform-production-dns:${stage}:ZoneId`
            }
          }
        ]
      });
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
        Port: 443,
        Protocol: 'HTTPS'
      });
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
        Port: 80,
        DefaultActions: [
          {
            Type: 'redirect',
            RedirectConfig: {
              Host: domain,
              Port: '443',
              Protocol: 'HTTPS',
              StatusCode: 'HTTP_301'
            }
          }
        ]
      });
      template.hasOutput('ApplicationUrl', { Value: `https://${domain}` });
      template.resourceCountIs('AWS::Lambda::Function', 0);
    }
  );
  it('fails before synthesis when managed HTTPS is enabled without managed DNS', () => {
    vi.stubEnv('MANAGED_DNS', 'false');
    vi.stubEnv('MANAGED_HTTPS', 'true');
    expect(() => configure()).toThrow(/requires MANAGED_DNS/);
  });
  it('rejects conflicting external certificates', () => {
    vi.stubEnv('MANAGED_HTTPS', 'true');
    vi.stubEnv(
      'CERTIFICATE_ARN',
      'arn:aws:acm:us-east-1:123456789012:certificate/example'
    );
    expect(() => configure()).toThrow(/CERTIFICATE_ARN/);
  });
  it.each(['tru', '1', 'TRUE'])('rejects misspelled flags %s', (value) => {
    vi.stubEnv('MANAGED_DNS', value);
    expect(() => configure()).toThrow(/MANAGED_DNS/);
  });
  it('cannot put managed subdomains on legacy staging or preview stacks', () => {
    expect(() => configure('staging')).toThrow(/production or canary/);
  });
});
