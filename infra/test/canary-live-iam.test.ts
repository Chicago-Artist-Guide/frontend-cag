import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseCanaryTemplate } from '../bootstrap/canary-iam-migration.js';
import { verifyCanaryIam } from '../bootstrap/verify-canary-iam.js';

const account = '123456789012';
const region = 'us-east-1';
const policyArn = `arn:aws:iam::${account}:policy/CagCanaryCloudFormationExecution`;
const template = parseCanaryTemplate(
  readFileSync(join(process.cwd(), 'bootstrap/canary-iam.yaml'), 'utf8')
);

// These represent IAM responses independently of CloudFormation's stored template.
const liveIam = () => {
  const roles = Object.fromEntries(
    [
      ['Plan', 'canary-plan', 'ReadCanaryState'],
      ['Deploy', 'canary', 'UseDedicatedCdkBootstrap'],
      ['Destroy', 'canary-destroy', 'UseDedicatedCdkBootstrap']
    ].map(([kind, environment, policy]) => {
      const RoleName = `CagGithubCanary${kind}Role`;
      return [
        RoleName,
        {
          Role: {
            Arn: `arn:aws:iam::${account}:role/${RoleName}`,
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: {
                    Federated: `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`
                  },
                  Action: 'sts:AssumeRoleWithWebIdentity',
                  Condition: {
                    StringEquals: {
                      'token.actions.githubusercontent.com:aud':
                        'sts.amazonaws.com',
                      'token.actions.githubusercontent.com:sub': `repo:Chicago-Artist-Guide/frontend-cag:environment:${environment}`
                    }
                  }
                }
              ]
            } as unknown,
            Path: '/',
            PermissionsBoundary: undefined as
              | { PermissionsBoundaryArn: string }
              | undefined,
            RoleName
          },
          AttachedPolicies: [] as { PolicyArn: string; PolicyName: string }[],
          PolicyNames: [policy],
          PolicyDocument: {
            Version: '2012-10-17',
            Statement:
              kind === 'Plan'
                ? [
                    {
                      Effect: 'Allow',
                      Resource: '*',
                      Action: [
                        'cloudformation:DescribeStacks',
                        'cloudformation:GetTemplate',
                        'ec2:Describe*',
                        'elasticloadbalancing:Describe*',
                        'ecs:Describe*',
                        'ecs:List*',
                        'iam:GetRole',
                        'logs:DescribeLogGroups',
                        'ssm:GetParameter'
                      ]
                    }
                  ]
                : [
                    {
                      Effect: 'Allow',
                      Action: 'sts:AssumeRole',
                      Resource: (kind === 'Deploy'
                        ? [
                            'deploy',
                            'file-publishing',
                            'image-publishing',
                            'lookup'
                          ]
                        : ['deploy', 'lookup']
                      ).map(
                        (purpose) =>
                          `arn:aws:iam::${account}:role/cdk-cagcanary-${purpose}-role-${account}-*`
                      )
                    },
                    {
                      Effect: 'Allow',
                      Resource: '*',
                      Action: [
                        'cloudformation:DescribeStacks',
                        'ssm:GetParameter'
                      ]
                    }
                  ]
          } as unknown
        }
      ];
    })
  );
  const statement = (
    Sid: string,
    Action: string | string[],
    Resource: unknown
  ) => ({ Sid, Effect: 'Allow', Resource, Action });
  return {
    roles,
    policy: {
      Arn: policyArn,
      DefaultVersionId: 'v7',
      Description:
        'Actions needed by CloudFormation to manage CagPlatform-canary',
      Path: '/',
      PolicyName: 'CagCanaryCloudFormationExecution',
      AttachmentCount: 1 // The dedicated CDK cfnexec role legitimately attaches it.
    },
    version: {
      VersionId: 'v7',
      IsDefaultVersion: true,
      Document: {
        Version: '2012-10-17',
        Statement: [
          statement(
            'Ec2Networking',
            [
              'ec2:AssociateRouteTable',
              'ec2:AttachInternetGateway',
              'ec2:AuthorizeSecurityGroupEgress',
              'ec2:AuthorizeSecurityGroupIngress',
              'ec2:CreateInternetGateway',
              'ec2:CreateRoute',
              'ec2:CreateRouteTable',
              'ec2:CreateSecurityGroup',
              'ec2:CreateSubnet',
              'ec2:CreateTags',
              'ec2:CreateVpc',
              'ec2:DeleteInternetGateway',
              'ec2:DeleteRoute',
              'ec2:DeleteRouteTable',
              'ec2:DeleteSecurityGroup',
              'ec2:DeleteSubnet',
              'ec2:DeleteTags',
              'ec2:DeleteVpc',
              'ec2:Describe*',
              'ec2:DetachInternetGateway',
              'ec2:DisassociateRouteTable',
              'ec2:ModifySubnetAttribute',
              'ec2:ModifyVpcAttribute',
              'ec2:RevokeSecurityGroupEgress',
              'ec2:RevokeSecurityGroupIngress'
            ],
            '*'
          ),
          statement(
            'EcsCanary',
            [
              'ecs:CreateCluster',
              'ecs:CreateService',
              'ecs:DeleteCluster',
              'ecs:DeleteService',
              'ecs:DeregisterTaskDefinition',
              'ecs:DescribeClusters',
              'ecs:DescribeServices',
              'ecs:DescribeTaskDefinition',
              'ecs:ListClusters',
              'ecs:ListServices',
              'ecs:ListTagsForResource',
              'ecs:ListTaskDefinitions',
              'ecs:RegisterTaskDefinition',
              'ecs:TagResource',
              'ecs:UntagResource',
              'ecs:UpdateService'
            ],
            '*'
          ),
          statement(
            'LoadBalancing',
            [
              'elasticloadbalancing:AddTags',
              'elasticloadbalancing:CreateListener',
              'elasticloadbalancing:CreateLoadBalancer',
              'elasticloadbalancing:CreateRule',
              'elasticloadbalancing:CreateTargetGroup',
              'elasticloadbalancing:DeleteListener',
              'elasticloadbalancing:DeleteLoadBalancer',
              'elasticloadbalancing:DeleteRule',
              'elasticloadbalancing:DeleteTargetGroup',
              'elasticloadbalancing:Describe*',
              'elasticloadbalancing:ModifyListener',
              'elasticloadbalancing:ModifyLoadBalancerAttributes',
              'elasticloadbalancing:ModifyRule',
              'elasticloadbalancing:ModifyTargetGroup',
              'elasticloadbalancing:ModifyTargetGroupAttributes',
              'elasticloadbalancing:RemoveTags',
              'elasticloadbalancing:SetSecurityGroups',
              'elasticloadbalancing:SetSubnets'
            ],
            '*'
          ),
          statement(
            'CanaryLogs',
            [
              'logs:CreateLogGroup',
              'logs:DeleteLogGroup',
              'logs:ListTagsForResource',
              'logs:PutRetentionPolicy',
              'logs:TagResource',
              'logs:UntagResource'
            ],
            [`arn:aws:logs:${region}:${account}:log-group:/cag/canary*`]
          ),
          statement('CanaryLogDiscovery', 'logs:DescribeLogGroups', [
            `arn:aws:logs:${region}:${account}:log-group:*`
          ]),
          statement(
            'ReadBootstrapVersion',
            ['ssm:GetParameter', 'ssm:GetParameters'],
            [
              `arn:aws:ssm:${region}:${account}:parameter/cdk-bootstrap/cagcanary/version`
            ]
          ),
          statement(
            'CanaryScaling',
            [
              'application-autoscaling:DeleteScalingPolicy',
              'application-autoscaling:DeregisterScalableTarget',
              'application-autoscaling:DescribeScalingActivities',
              'application-autoscaling:DescribeScalingPolicies',
              'application-autoscaling:DescribeScalableTargets',
              'application-autoscaling:PutScalingPolicy',
              'application-autoscaling:RegisterScalableTarget',
              'cloudwatch:DeleteAlarms',
              'cloudwatch:DescribeAlarms',
              'cloudwatch:PutMetricAlarm'
            ],
            '*'
          ),
          statement(
            'CanaryTaskRoles',
            [
              'iam:AttachRolePolicy',
              'iam:CreateRole',
              'iam:DeleteRole',
              'iam:DeleteRolePolicy',
              'iam:DetachRolePolicy',
              'iam:GetRole',
              'iam:GetRolePolicy',
              'iam:ListAttachedRolePolicies',
              'iam:ListRolePolicies',
              'iam:PassRole',
              'iam:PutRolePolicy',
              'iam:TagRole',
              'iam:UntagRole',
              'iam:UpdateAssumeRolePolicy'
            ],
            `arn:aws:iam::${account}:role/CagPlatform-canary-*`
          ),
          {
            ...statement(
              'RequiredServiceLinkedRoles',
              'iam:CreateServiceLinkedRole',
              '*'
            ),
            Condition: {
              StringEquals: {
                'iam:AWSServiceName': [
                  'ecs.amazonaws.com',
                  'elasticloadbalancing.amazonaws.com',
                  'ecs.application-autoscaling.amazonaws.com'
                ]
              }
            }
          }
        ]
      } as unknown
    }
  };
};

const reader =
  (live: ReturnType<typeof liveIam>, calls: string[][] = []) =>
  (args: string[]): unknown => {
    calls.push(args);
    const role = live.roles[args[args.indexOf('--role-name') + 1]];
    switch (args[1]) {
      case 'get-role':
        return { Role: role.Role };
      case 'list-role-policies':
        return { PolicyNames: role.PolicyNames };
      case 'get-role-policy':
        return { PolicyDocument: role.PolicyDocument };
      case 'list-attached-role-policies':
        return { AttachedPolicies: role.AttachedPolicies };
      case 'get-policy':
        return { Policy: live.policy };
      case 'get-policy-version':
        return { PolicyVersion: live.version };
      default:
        throw new Error(`Unexpected AWS call: ${args.join(' ')}`);
    }
  };

describe('live canary IAM verification', () => {
  it('reads the actual roles and default policy version using only bounded read APIs', () => {
    const calls: string[][] = [];
    expect(() =>
      verifyCanaryIam(template, account, region, reader(liveIam(), calls))
    ).not.toThrow();
    expect(calls).toHaveLength(14);
    expect(new Set(calls.map((args) => args[1]))).toEqual(
      new Set([
        'get-role',
        'list-role-policies',
        'get-role-policy',
        'list-attached-role-policies',
        'get-policy',
        'get-policy-version'
      ])
    );
    expect(calls.every((args) => args[0] === 'iam')).toBe(true);
    expect(calls.find((args) => args[1] === 'get-policy-version')).toContain(
      'v7'
    );
  });

  it.each([
    'trust',
    'inline',
    'managed',
    'boundary',
    'attachment',
    'inline-name',
    'role-name',
    'role-path',
    'policy-name',
    'policy-path',
    'policy-description'
  ])(
    'rejects actual %s drift even while CloudFormation has the unchanged repository template',
    (drift) => {
      const storedTemplate = structuredClone(template);
      const actual = liveIam();
      const role = actual.roles.CagGithubCanaryPlanRole;
      if (drift === 'trust')
        role.Role.AssumeRolePolicyDocument = { Statement: [] };
      if (drift === 'inline') role.PolicyDocument = { Statement: [] };
      if (drift === 'managed') actual.version.Document = { Statement: [] };
      if (drift === 'boundary')
        role.Role.PermissionsBoundary = { PermissionsBoundaryArn: policyArn };
      if (drift === 'attachment')
        role.AttachedPolicies.push({
          PolicyArn: policyArn,
          PolicyName: actual.policy.PolicyName
        });
      if (drift === 'inline-name')
        role.PolicyNames.push('UnexpectedPrivileges');
      if (drift === 'role-name') role.Role.RoleName = 'UnrelatedRole';
      if (drift === 'role-path') role.Role.Path = '/unexpected/';
      if (drift === 'policy-name') actual.policy.PolicyName = 'UnrelatedPolicy';
      if (drift === 'policy-path') actual.policy.Path = '/unexpected/';
      if (drift === 'policy-description')
        actual.policy.Description = 'Unexpected description';
      expect(storedTemplate).toEqual(template);
      expect(() =>
        verifyCanaryIam(storedTemplate, account, region, reader(actual))
      ).toThrow(/live canary IAM drift/i);
    }
  );

  it('accepts encoded documents and reordered policy statements, actions, resources and conditions', () => {
    const actual = liveIam();
    const reorder = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(reorder).reverse();
      if (value && typeof value === 'object')
        return Object.fromEntries(
          Object.entries(value)
            .reverse()
            .map(([key, item]) => [key, reorder(item)])
        );
      return value;
    };
    for (const role of Object.values(actual.roles)) {
      role.Role.AssumeRolePolicyDocument = encodeURIComponent(
        JSON.stringify(reorder(role.Role.AssumeRolePolicyDocument))
      );
      role.PolicyDocument = encodeURIComponent(
        JSON.stringify(reorder(role.PolicyDocument))
      );
    }
    actual.version.Document = encodeURIComponent(
      JSON.stringify(reorder(actual.version.Document))
    );
    expect(() =>
      verifyCanaryIam(template, account, region, reader(actual))
    ).not.toThrow();
  });

  it('accepts equivalent singleton Action and Resource arrays', () => {
    const actual = liveIam();
    const trust = actual.roles.CagGithubCanaryPlanRole.Role
      .AssumeRolePolicyDocument as {
      Statement: { Action: unknown }[];
    };
    trust.Statement[0].Action = ['sts:AssumeRoleWithWebIdentity'];
    const inline = actual.roles.CagGithubCanaryPlanRole.PolicyDocument as {
      Statement: { Resource: unknown }[];
    };
    inline.Statement[0].Resource = ['*'];
    expect(() =>
      verifyCanaryIam(template, account, region, reader(actual))
    ).not.toThrow();
  });

  it.each([
    'get-role',
    'list-role-policies',
    'get-role-policy',
    'list-attached-role-policies',
    'get-policy',
    'get-policy-version'
  ])('fails closed when %s is denied', (operation) => {
    const read = reader(liveIam());
    expect(() =>
      verifyCanaryIam(template, account, region, (args) => {
        if (args[1] === operation) throw new Error('AccessDenied');
        return read(args);
      })
    ).toThrow(/AccessDenied/);
  });

  it('rejects incomplete IAM list responses instead of assuming an empty policy set', () => {
    const read = reader(liveIam());
    expect(() =>
      verifyCanaryIam(template, account, region, (args) =>
        args[1] === 'list-attached-role-policies' ? {} : read(args)
      )
    ).toThrow();
  });

  it.each(['list-role-policies', 'list-attached-role-policies'])(
    'rejects truncated %s responses',
    (operation) => {
      const read = reader(liveIam());
      expect(() =>
        verifyCanaryIam(template, account, region, (args) => {
          const response = read(args) as Record<string, unknown>;
          return args[1] === operation
            ? { ...response, IsTruncated: true }
            : response;
        })
      ).toThrow(/Incomplete/);
    }
  );

  it('rejects a default policy version that changed between the two reads', () => {
    const actual = liveIam();
    actual.version.IsDefaultVersion = false;
    expect(() =>
      verifyCanaryIam(template, account, region, reader(actual))
    ).toThrow(/default policy version status/);
  });

  it('resolves explicit parameter Refs and Fn::Sub variable maps with workload pseudo-parameters', () => {
    const expected = structuredClone(template);
    expected.Parameters = {
      ...(expected.Parameters as Record<string, unknown>),
      ExpectedRoleName: { Type: 'String', Default: 'CagGithubCanaryPlanRole' }
    };
    expected.Resources.CanaryPlanRole.Properties.RoleName = {
      Ref: 'ExpectedRoleName'
    };
    const policy = expected.Resources.CanaryCloudFormationExecutionPolicy
      .Properties.PolicyDocument as {
      Statement: { Sid: string; Resource: unknown }[];
    };
    const logs = policy.Statement.find(
      (statement) => statement.Sid === 'CanaryLogs'
    );
    if (!logs) throw new Error('Missing expected logs statement');
    logs.Resource = [
      {
        'Fn::Sub': [
          'arn:${AWS::Partition}:logs:${Region}:${AWS::AccountId}:log-group:/cag/canary*',
          { Region: { Ref: 'AWS::Region' } }
        ]
      }
    ];
    expect(() =>
      verifyCanaryIam(expected, account, region, reader(liveIam()))
    ).not.toThrow();
  });

  it('rejects unresolved template intrinsics before making AWS reads', () => {
    const invalid = structuredClone(template);
    invalid.Resources.CanaryPlanRole.Properties.RoleName = {
      Ref: 'MissingParameter'
    };
    const calls: string[][] = [];
    expect(() =>
      verifyCanaryIam(invalid, account, region, reader(liveIam(), calls))
    ).toThrow(/unresolved|unsupported/i);
    expect(calls).toEqual([]);
  });

  it.each(['normal', 'denied', 'managed-drift'])(
    'runs the real CLI against isolated IAM responses: %s',
    (scenario) => {
      const directory = mkdtempSync(join(tmpdir(), 'cag-live-iam-'));
      try {
        const fakeAws = join(directory, 'aws');
        const actual = liveIam();
        if (scenario === 'managed-drift')
          actual.version.Document = { Statement: [] };
        writeFileSync(join(directory, 'actual.json'), JSON.stringify(actual));
        writeFileSync(
          fakeAws,
          `#!${process.execPath}
const fs = require('node:fs');
const directory = process.env.CAG_LIVE_IAM_FIXTURE;
const args = process.argv.slice(2);
fs.appendFileSync(directory + '/calls.jsonl', JSON.stringify(args) + String.fromCharCode(10));
if (process.env.CAG_LIVE_IAM_SCENARIO === 'denied') {
  process.stderr.write('AccessDenied'); process.exit(1);
}
const live = JSON.parse(fs.readFileSync(directory + '/actual.json', 'utf8'));
const role = live.roles[args[args.indexOf('--role-name') + 1]];
let result;
switch (args[1]) {
  case 'get-role': result = { Role: role.Role }; break;
  case 'list-role-policies': result = { PolicyNames: role.PolicyNames }; break;
  case 'get-role-policy': result = { PolicyDocument: role.PolicyDocument }; break;
  case 'list-attached-role-policies': result = { AttachedPolicies: role.AttachedPolicies }; break;
  case 'get-policy': result = { Policy: live.policy }; break;
  case 'get-policy-version': result = { PolicyVersion: live.version }; break;
  default: throw new Error('Unexpected command: ' + args.join(' '));
}
process.stdout.write(JSON.stringify(result));
`
        );
        chmodSync(fakeAws, 0o755);
        const result = spawnSync(
          process.execPath,
          [
            '--import',
            'tsx',
            'bootstrap/verify-canary-iam.ts',
            'bootstrap/canary-iam.yaml',
            account,
            region
          ],
          {
            encoding: 'utf8',
            env: {
              ...process.env,
              CAG_LIVE_IAM_FIXTURE: directory,
              CAG_LIVE_IAM_SCENARIO: scenario,
              PATH: `${directory}:${process.env.PATH}`
            }
          }
        );
        if (scenario === 'normal') {
          expect(result.status, result.stderr).toBe(0);
          const calls = readFileSync(join(directory, 'calls.jsonl'), 'utf8')
            .trim()
            .split(String.fromCharCode(10))
            .map((line) => JSON.parse(line) as string[]);
          expect(calls).toHaveLength(14);
          expect(
            calls.every(
              (args) => args.includes(region) && args.includes('--no-cli-pager')
            )
          ).toBe(true);
        } else {
          expect(result.status).not.toBe(0);
          expect(result.stderr).toMatch(
            scenario === 'denied' ? /AccessDenied/ : /live canary IAM drift/i
          );
        }
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );
});
