import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowDirectory = join(process.cwd(), '.github', 'workflows');
const readWorkflow = (name: string) =>
  readFileSync(join(workflowDirectory, name), 'utf8');

const deploymentWorkflowNames = [
  'deploy-environment.yml',
  'preview-deploy.yml',
  'preview-destroy.yml'
];

const externalActionPattern = /^\s*uses:\s*([^./\s][^@\s]*)@([^\s#]+)\s*(?:#.*)?$/gm;

describe('GitHub workflow contracts', () => {
  it('keeps pull request CI credential-free and pins every action by SHA', () => {
    const workflow = readWorkflow('pull-request.yml');

    expect(workflow).toContain('pull_request:');
    expect(workflow).not.toContain('id-token: write');
    expect(workflow).not.toContain('configure-aws-credentials');
    expect(workflow).not.toMatch(/AWS_(?:ACCESS_KEY_ID|SECRET_ACCESS_KEY)/);
    expect(workflow).toContain(
      'actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd'
    );
    expect(workflow).toContain(
      'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e'
    );
    expect(workflow).toContain('npm --prefix infra ci');
    expect(workflow).toContain('npm --prefix infra run verify');
    expect(workflow).toContain('linux/amd64');
    expect(workflow).toContain('.next/standalone/.next/static');
    expect(workflow).toContain('.next/standalone/public');
    expect(workflow).toContain('1001:1001');
    expect(workflow).toContain('uname -m');
    expect(workflow).toContain('docker logs');
    expect(workflow).toContain('docker rm --force');
  });

  it.each(deploymentWorkflowNames)(
    '%s is manual-only, least-privilege, GitHub-hosted, and serialized',
    (name) => {
      const workflow = readWorkflow(name);

      expect(workflow).toMatch(/\bon:\s*\n\s+workflow_dispatch:/);
      expect(workflow).not.toMatch(/^\s+(?:push|pull_request|schedule):/m);
      expect(workflow).toMatch(/permissions:\s*\n\s+contents:\s*read/);
      const topLevelPermissions = workflow.match(
        /^permissions:\s*\n((?: {2}\S[^\n]*\n?)*)/m
      )?.[1];
      expect(topLevelPermissions).toBeDefined();
      expect(topLevelPermissions).not.toContain('id-token: write');
      expect(workflow).toContain('runs-on: ubuntu-latest');
      expect(workflow).toContain('cancel-in-progress: false');
      expect(workflow).toContain('id-token: write');
      expect(workflow).toContain(
        'aws-actions/configure-aws-credentials@d979d5b3a71173a29b74b5b88418bfda9437d885'
      );
      expect(workflow).toContain('allowed-account-ids:');
      expect(workflow).toContain('mask-aws-account-id: true');
      expect(workflow).toContain('role-session-name:');
      expect(workflow).toContain('vars.AWS_ACCOUNT_ID');
      expect(workflow).toContain('vars.AWS_REGION');
      expect(workflow).toContain('vars.AWS_ROLE_ARN');
      expect(workflow).not.toMatch(/secrets\.AWS_/);
    }
  );

  it('uses separate protected plan/deploy environments and validates before auth', () => {
    const durable = readWorkflow('deploy-environment.yml');
    const preview = readWorkflow('preview-deploy.yml');
    const destroy = readWorkflow('preview-destroy.yml');

    expect(durable).toContain("format('{0}-plan', inputs.stage)");
    expect(durable).toContain('environment: ${{ inputs.stage }}');
    expect(preview).toContain('environment: preview-plan');
    expect(preview).toContain('environment: preview');
    expect(destroy).toContain('environment: preview-destroy');

    for (const workflow of [durable, preview, destroy]) {
      expect(workflow.indexOf('Validate deployment target')).toBeLessThan(
        workflow.indexOf('Configure AWS credentials')
      );
    }
  });

  it('takes all application build values from GitHub Environment variables', () => {
    for (const name of ['deploy-environment.yml', 'preview-deploy.yml']) {
      const workflow = readWorkflow(name);

      for (const variable of [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
        'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
        'NEXT_PUBLIC_LGL_API_KEY'
      ]) {
        expect(workflow).toContain(`${variable}: \${{ vars.${variable} }}`);
      }

      expect(workflow).toContain('node scripts/public-env.mjs');
    }
  });

  it('keeps preview destruction independent of application build values', () => {
    const destroy = readWorkflow('preview-destroy.yml');

    expect(destroy).not.toContain('NEXT_PUBLIC_');
    expect(destroy).toContain('AWS_ACCOUNT_ID: ${{ vars.AWS_ACCOUNT_ID }}');
    expect(destroy).toContain('AWS_REGION: ${{ vars.AWS_REGION }}');
    expect(destroy).toContain('AWS_ROLE_ARN: ${{ vars.AWS_ROLE_ARN }}');
  });

  it('runs every CDK command from the infrastructure package', () => {
    for (const name of deploymentWorkflowNames) {
      const workflow = readWorkflow(name);
      const cdkCommandCount = (workflow.match(/npm exec cdk --/g) || []).length;
      const infraWorkingDirectoryCount = (
        workflow.match(/working-directory: infra/g) || []
      ).length;

      expect(cdkCommandCount).toBeGreaterThan(0);
      expect(infraWorkingDirectoryCount).toBe(cdkCommandCount);
      expect(workflow).not.toContain('npm --prefix infra exec cdk');
    }
  });

  it('uses immutable external actions and contains no machine or credential material', () => {
    const workflows = ['pull-request.yml', ...deploymentWorkflowNames].map(
      readWorkflow
    );

    for (const workflow of workflows) {
      for (const [, action, ref] of workflow.matchAll(externalActionPattern)) {
        expect(`${action}@${ref}`).toMatch(/^[^@]+@[0-9a-f]{40}$/);
      }

      expect(workflow).not.toMatch(/AKIA[0-9A-Z]{16}/);
      expect(workflow).not.toMatch(/arn:aws(?:-[a-z]+)?:iam::\d{12}:role\//);
      expect(workflow).not.toMatch(/\b\d{12}\b/);
      expect(workflow).not.toContain('/Users/');
      expect(workflow).not.toContain('/home/');
      expect(workflow).not.toContain('self-hosted');
    }
  });
});
