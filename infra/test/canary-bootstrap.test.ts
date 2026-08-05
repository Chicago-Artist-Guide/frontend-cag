import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const bootstrapDirectory = join(process.cwd(), 'bootstrap');
const template = readFileSync(
  join(bootstrapDirectory, 'canary-iam.yaml'),
  'utf8'
);
const script = readFileSync(
  join(bootstrapDirectory, 'bootstrap-canary.sh'),
  'utf8'
);

describe('canary bootstrap boundary', () => {
  it('uses distinct environment-scoped OIDC roles', () => {
    expect(template).toContain(
      'environment:canary-plan'
    );
    expect(template).toContain('environment:canary');
    expect(template).toContain('environment:canary-destroy');
    expect(template).toContain('CagGithubCanaryPlanRole');
    expect(template).toContain('CagGithubCanaryDeployRole');
    expect(template).toContain('CagGithubCanaryDestroyRole');
  });

  it('contains no administrator or all-action grants', () => {
    expect(template).not.toContain('AdministratorAccess');
    expect(template).not.toMatch(/Action:\s*['"]?\*['"]?/);
    expect(script).not.toContain('AdministratorAccess');
  });

  it('uses a dedicated qualifier and exact account guard', () => {
    expect(script).toContain('EXPECTED_ACCOUNT_ID="095377239347"');
    expect(script).toContain('QUALIFIER="cagcanary"');
    expect(script).toContain('--cloudformation-execution-policies');
    expect(script).toContain('--trust-for-lookup');
  });

  it('keeps workload-region permissions independent of the IAM stack region', () => {
    expect(template).toContain('WorkloadRegion:');
    expect(template).toContain('logs:${WorkloadRegion}:${AWS::AccountId}:log-group:/cag/canary*');
    expect(script).toContain('--parameter-overrides "WorkloadRegion=$AWS_REGION"');
  });

  it('lets the execution role read only the dedicated bootstrap version parameter', () => {
    expect(template).toContain(
      'ssm:${WorkloadRegion}:${AWS::AccountId}:parameter/cdk-bootstrap/${BootstrapQualifier}/version'
    );
  });
});
