import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { createTestApp } from './test-app.js';
import { scopeProductionBootstrap } from '../bootstrap/scope-bootstrap.js';

const template = readFileSync(
  join(process.cwd(), 'bootstrap/production-iam.yaml'),
  'utf8'
);
const script = readFileSync(
  join(process.cwd(), 'bootstrap/bootstrap-production.sh'),
  'utf8'
);

describe('production bootstrap boundary', () => {
  it('creates production-only entry roles and no destruction entry role', () => {
    expect(template).toContain('environment:production-plan');
    expect(template).toContain('environment:production');
    expect(template).toContain('role/CagPlatform-production-*');
    expect(template).toContain('log-group:/cag/production*');
    expect(template).not.toContain('canary');
    expect(template).not.toContain('ProductionDestroyRole');
    expect(template).not.toContain('AdministratorAccess');
    expect(template).not.toMatch(/Action:\s*['"]?\*['"]?/);
  });

  it('bootstraps production separately without updating the canary toolkit', () => {
    expect(script).toContain('--toolkit-stack-name CDKToolkit-cagprod');
    expect(script).toContain('--qualifier cagprod');
    expect(script).toContain(
      '--cloudformation-execution-policies "$EXECUTION_POLICY_ARN"'
    );
    expect(script).toContain('test "$ACTUAL_ACCOUNT_ID" = "$AWS_ACCOUNT_ID"');
  });
});

describe('production CDK bootstrap role', () => {
  it('adds a stack-scoped boundary to the pinned deployment role', () => {
    const stock = readFileSync(
      join(
        process.cwd(),
        'node_modules/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml'
      ),
      'utf8'
    );
    const scoped = scopeProductionBootstrap(stock);
    expect(scoped).toContain(
      'PermissionsBoundary:\n        Fn::Sub: arn:${AWS::Partition}:iam::${AWS::AccountId}:policy/CagProductionDeploymentBoundary'
    );
    expect(scoped.length).toBeGreaterThan(stock.length);
    expect(template).toContain('stack/CagPlatform-production/*');
    expect(template).toContain('iam:PermissionsBoundary:');
    expect(script).toContain('--template "$BOOTSTRAP_TEMPLATE"');
  });
  it('fails closed if the pinned bootstrap structure changes', () => {
    expect(() => scopeProductionBootstrap('unexpected')).toThrow(/not unique/);
  });
});

describe('production CloudFormation templates', () => {
  it.each(['production-iam.yaml', 'bootstrap-iam.yaml', 'canary-iam.yaml'])(
    'parses %s using the CloudFormation schema',
    (name) => {
      const app = createTestApp();
      const stack = new Stack(app, 'Delivery');
      new CfnInclude(stack, 'Template', {
        templateFile: join(process.cwd(), 'bootstrap', name)
      });
      expect(
        Object.keys(Template.fromStack(stack).toJSON().Resources).length
      ).toBeGreaterThan(0);
    }
  );
  it('bounds the actual bootstrap deployment role in the generated template', () => {
    const app = createTestApp();
    const stock = readFileSync(
      join(
        process.cwd(),
        'node_modules/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml'
      ),
      'utf8'
    );
    const file = join(app.outdir, 'bootstrap.yaml');
    writeFileSync(file, scopeProductionBootstrap(stock));
    const stack = new Stack(app, 'Bootstrap');
    new CfnInclude(stack, 'Template', { templateFile: file });
    expect(
      JSON.stringify(
        Template.fromStack(stack).toJSON().Resources.DeploymentActionRole
          .Properties.PermissionsBoundary
      )
    ).toContain('CagProductionDeploymentBoundary');
  });
});

describe('main-only delivery bootstrap entry role', () => {
  const load = (name: string) => {
    const stack = new Stack(createTestApp(), 'Entry');
    new CfnInclude(stack, 'Template', {
      templateFile: join(process.cwd(), 'bootstrap', name)
    });
    return Template.fromStack(stack).toJSON();
  };

  it('trusts only the dedicated environment and restricts policy attachments', () => {
    const role = load('bootstrap-iam.yaml').Resources.BootstrapRole.Properties;
    expect(role.AssumeRolePolicyDocument.Statement).toEqual([
      expect.objectContaining({
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            'token.actions.githubusercontent.com:sub':
              'repo:Chicago-Artist-Guide/frontend-cag:environment:production-bootstrap'
          }
        }
      })
    ]);
    const statements = role.Policies[0].PolicyDocument.Statement as {
      Action: string | string[];
      Condition?: { ArnLike?: { 'iam:PolicyARN'?: unknown } };
      Resource: unknown;
      Effect: string;
    }[];
    expect(JSON.stringify(statements)).not.toContain('AdministratorAccess');
    for (const statement of statements) {
      const actions = [statement.Action].flat();
      expect(actions).not.toContain('*');
      if (actions.includes('iam:AttachRolePolicy')) {
        expect(statement.Condition?.ArnLike?.['iam:PolicyARN']).toBeDefined();
      }
    }
    expect(statements).toContainEqual({
      Action: 'iam:DeleteRolePermissionsBoundary',
      Effect: 'Deny',
      Resource: '*'
    });
    for (const policy of [
      'ReadOnlyAccess',
      'AWSCloudFormationReadOnlyAccess'
    ]) {
      const attachment = statements.find((statement) =>
        JSON.stringify(statement.Condition ?? {}).includes(`policy/${policy}`)
      );
      expect(attachment).toBeDefined();
      expect(JSON.stringify(attachment?.Resource)).toContain(
        policy === 'ReadOnlyAccess' ? 'lookup-role' : 'deploy-role'
      );
    }
  });

  it('retains every canary IAM resource and forces the policy-only update', () => {
    const resources = load('canary-iam.yaml').Resources;
    expect(Object.keys(resources)).toHaveLength(4);
    for (const resource of Object.values(resources) as {
      DeletionPolicy?: string;
      UpdateReplacePolicy?: string;
    }[]) {
      expect(resource.DeletionPolicy).toBe('Retain');
      expect(resource.UpdateReplacePolicy).toBe('Retain');
    }
    expect(resources.CanaryCloudFormationExecutionPolicy.Metadata).toEqual({
      DeliveryRegion: 'us-east-1'
    });
  });

  it('selects an AWS managed key on both initial bootstrap and reruns', () => {
    expect(script).toContain('--bootstrap-kms-key-id AWS_MANAGED_KEY');
  });
});
