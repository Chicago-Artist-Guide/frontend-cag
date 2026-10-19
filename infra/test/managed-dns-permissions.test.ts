import { join } from 'node:path';
import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { createTestApp } from './test-app.js';

const policyFor = (stage: string) => {
  const stack = new Stack(createTestApp(), 'Delivery');
  new CfnInclude(stack, 'Template', {
    templateFile: join(process.cwd(), 'bootstrap', `${stage}-iam.yaml`)
  });
  const name = stage === 'production' ? 'Production' : 'Canary';
  const resources = Template.fromStack(stack).toJSON().Resources;
  const policies = [
    `${name}CloudFormationExecutionPolicy`,
    ...(stage === 'production' ? ['ProductionManagedDnsExecutionPolicy'] : [])
  ].map((id) => resources[id].Properties.PolicyDocument);
  const substitutions: Record<string, string> = {
    'AWS::Partition': 'aws',
    'AWS::AccountId': '123456789012',
    WorkloadRegion: 'us-east-1',
    BootstrapQualifier: stage === 'production' ? 'cagprod' : 'cagcanary'
  };
  for (const policy of policies) {
    // IAM counts the resolved document, not CloudFormation's Fn::Sub wrapper.
    const resolved = JSON.stringify(policy, (_key, value: unknown) => {
      if (value && typeof value === 'object' && 'Fn::Sub' in value) {
        const pattern = (value as { 'Fn::Sub': string })['Fn::Sub'];
        return pattern.replace(/\$\{([^}]+)\}/g, (_match, name: string) => {
          if (!substitutions[name])
            throw new Error(`Unresolved policy reference ${name}`);
          return substitutions[name];
        });
      }
      return value;
    });
    expect(resolved.length).toBeLessThanOrEqual(6144);
  }
  return policies.flatMap((policy) => policy.Statement) as Array<{
    Action: string | string[];
    Condition?: Record<string, unknown>;
  }>;
};

describe('managed DNS and certificate authority', () => {
  it.each([
    ['production', 'prod.chicagoartistguide.org'],
    ['canary', 'staging.chicagoartistguide.org']
  ])(
    'limits %s certificate requests and DNS record writes to its subdomain',
    (stage, domain) => {
      const policy = policyFor(stage);
      const request = policy.find((statement) =>
        [statement.Action].flat().includes('acm:RequestCertificate')
      );
      expect(request?.Condition).toEqual({
        'ForAllValues:StringEquals': { 'acm:DomainNames': [domain] },
        StringEquals: {
          'acm:ValidationMethod': 'DNS',
          'aws:RequestTag/Environment': stage,
          'aws:RequestTag/DeploymentId': stage
        },
        Null: { 'acm:DomainNames': 'false' }
      });
      const records = policy.filter((statement) =>
        [statement.Action].flat().includes('route53:ChangeResourceRecordSets')
      );
      expect(records).toHaveLength(2);
      expect(records.map((statement) => statement.Condition)).toEqual(
        expect.arrayContaining([
          {
            'ForAllValues:StringEquals': {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': [domain],
              'route53:ChangeResourceRecordSetsRecordTypes': ['A'],
              'route53:ChangeResourceRecordSetsActions': [
                'CREATE',
                'UPSERT',
                'DELETE'
              ]
            },
            Null: {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': 'false'
            }
          },
          {
            'ForAllValues:StringLike': {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': [
                `_*.${domain}`
              ]
            },
            'ForAllValues:StringEquals': {
              'route53:ChangeResourceRecordSetsRecordTypes': ['CNAME'],
              'route53:ChangeResourceRecordSetsActions': ['CREATE', 'UPSERT']
            },
            Null: {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': 'false'
            }
          }
        ])
      );
      for (const action of [
        'acm:AddTagsToCertificate',
        'acm:DeleteCertificate',
        'acm:UpdateCertificateOptions',
        'acm:RemoveTagsFromCertificate'
      ]) {
        const grant = policy.find(
          (statement) =>
            [statement.Action].flat().includes(action) &&
            ![statement.Action].flat().includes('acm:RequestCertificate')
        );
        expect(grant?.Condition?.StringEquals).toEqual({
          'aws:ResourceTag/Environment': stage,
          'aws:ResourceTag/DeploymentId': stage
        });
      }
      const actions = policy.flatMap((statement) => [statement.Action].flat());
      expect(actions).toEqual(
        expect.arrayContaining([
          'acm:DescribeCertificate',
          'acm:AddTagsToCertificate',
          'acm:ListTagsForCertificate',
          'acm:UpdateCertificateOptions',
          'acm:RemoveTagsFromCertificate',
          'acm:DeleteCertificate',
          'route53:GetChange',
          'route53:GetHostedZone',
          'route53:ListResourceRecordSets'
        ])
      );
      expect(actions).not.toContain('route53:DeleteHostedZone');
      if (stage === 'canary')
        expect(actions).not.toContain('route53:CreateHostedZone');
    }
  );
});
