import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  formatGitHubOutputs,
  isValidCagStackName,
  resolveWorkflowTarget
} from './deployment-target.mjs';

const execFileAsync = promisify(execFile);

describe('isValidCagStackName', () => {
  it('accepts every stack name resolveWorkflowTarget can produce', () => {
    expect(isValidCagStackName('CagPlatform-canary')).toBe(true);
    expect(isValidCagStackName('CagPlatform-staging')).toBe(true);
    expect(isValidCagStackName('CagPlatform-production')).toBe(true);
    expect(isValidCagStackName('CagPlatform-preview-pr-123')).toBe(true);
  });

  it('rejects names outside the platform contract', () => {
    expect(isValidCagStackName('CagPlatform-canary-extra')).toBe(false);
    expect(isValidCagStackName('CagPlatform-preview-')).toBe(false);
    expect(isValidCagStackName('OtherStack')).toBe(false);
    expect(isValidCagStackName(undefined)).toBe(false);
  });
});

describe('resolveWorkflowTarget', () => {
  it.each([
    [
      { ref: 'canary', stage: 'canary' },
      {
        cdkStage: 'canary',
        deployEnvironment: 'canary',
        deploymentId: 'canary',
        isEphemeral: false,
        planEnvironment: 'canary-plan',
        stackName: 'CagPlatform-canary',
        stageName: 'canary'
      }
    ],
    [
      { ref: 'staging', stage: 'staging' },
      {
        cdkStage: 'staging',
        deployEnvironment: 'staging',
        deploymentId: 'staging',
        isEphemeral: false,
        planEnvironment: 'staging-plan',
        stackName: 'CagPlatform-staging',
        stageName: 'staging'
      }
    ],
    [
      { ref: 'master', stage: 'production' },
      {
        cdkStage: 'production',
        deployEnvironment: 'production',
        deploymentId: 'production',
        isEphemeral: false,
        planEnvironment: 'production-plan',
        stackName: 'CagPlatform-production',
        stageName: 'production'
      }
    ],
    [
      { previewId: 'dev-511', ref: 'feature', stage: 'preview' },
      {
        cdkStage: 'preview',
        deployEnvironment: 'preview',
        deploymentId: 'preview-dev-511',
        isEphemeral: true,
        planEnvironment: 'preview-plan',
        stackName: 'CagPlatform-preview-dev-511',
        stageName: 'preview'
      }
    ]
  ])('resolves an exact CDK and GitHub target', (input, expected) => {
    expect(resolveWorkflowTarget(input)).toEqual(expected);
  });

  it('restricts canary deployment to the canary branch', () => {
    expect(() =>
      resolveWorkflowTarget({ ref: 'dev-512', stage: 'canary' })
    ).toThrow('must run from ref canary');
  });

  it.each([
    '',
    'ab',
    'a'.repeat(21),
    '-dev',
    'dev-',
    'DEV-511',
    'dev_511',
    'dev--511',
    'dev/511',
    'dev;echo',
    'staging',
    'production',
    'preview'
  ])('rejects the invalid or reserved preview ID %j', (previewId) => {
    expect(() =>
      resolveWorkflowTarget({ previewId, ref: 'feature', stage: 'preview' })
    ).toThrow(/preview/i);
  });

  it.each([
    [{ ref: 'master', stage: 'staging' }, 'staging'],
    [{ ref: 'staging', stage: 'production' }, 'master']
  ])('restricts durable deployments to their exact ref', (input, ref) => {
    expect(() => resolveWorkflowTarget(input)).toThrow(
      `must run from ref ${ref}`
    );
  });

  it('requires durable refs to be branches rather than same-named tags', () => {
    expect(() =>
      resolveWorkflowTarget({
        ref: 'master',
        refType: 'tag',
        stage: 'production'
      })
    ).toThrow('must run from a branch');
  });

  it('requires the exact preview stack name to confirm destruction', () => {
    expect(() =>
      resolveWorkflowTarget({
        confirmation: 'dev-511',
        operation: 'destroy',
        previewId: 'dev-511',
        ref: 'feature',
        stage: 'preview'
      })
    ).toThrow('confirmation must exactly equal CagPlatform-preview-dev-511');

    expect(
      resolveWorkflowTarget({
        confirmation: 'CagPlatform-preview-dev-511',
        operation: 'destroy',
        previewId: 'dev-511',
        ref: 'feature',
        stage: 'preview'
      }).stackName
    ).toBe('CagPlatform-preview-dev-511');
  });

  it('rejects destruction for durable targets and unknown operations', () => {
    expect(() =>
      resolveWorkflowTarget({
        confirmation: 'CagPlatform-staging',
        operation: 'destroy',
        ref: 'staging',
        stage: 'staging'
      })
    ).toThrow('Only preview targets may be destroyed');

    expect(() =>
      resolveWorkflowTarget({
        operation: 'shell',
        ref: 'master',
        stage: 'production'
      })
    ).toThrow('Unsupported operation');
  });

  it('emits only GitHub-output-safe key=value lines', () => {
    const target = resolveWorkflowTarget({
      previewId: 'dev-511',
      ref: 'feature',
      stage: 'preview'
    });

    expect(formatGitHubOutputs(target)).toBe(
      [
        'stage_name=preview',
        'cdk_stage=preview',
        'deployment_id=preview-dev-511',
        'stack_name=CagPlatform-preview-dev-511',
        'plan_environment=preview-plan',
        'deploy_environment=preview',
        'is_ephemeral=true'
      ].join('\n')
    );

    expect(() =>
      formatGitHubOutputs({ safe: 'value\ninjected=true' })
    ).toThrow('GitHub output values must be single-line');
  });
});

describe('deployment target CLI', () => {
  it('prints target outputs without evaluating argument text', async () => {
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        'scripts/deployment-target.mjs',
        '--stage',
        'preview',
        '--preview-id',
        'dev-511',
        '--ref',
        'feature'
      ],
      { cwd: process.cwd() }
    );

    expect(stdout).toContain('stack_name=CagPlatform-preview-dev-511\n');
    expect(stdout).not.toContain('undefined');
  });

  it('accepts an exact durable branch and rejects a same-named tag', async () => {
    await expect(
      execFileAsync(
        process.execPath,
        [
          'scripts/deployment-target.mjs',
          '--stage',
          'production',
          '--ref',
          'master',
          '--ref-type',
          'branch'
        ],
        { cwd: process.cwd() }
      )
    ).resolves.toMatchObject({
      stdout: expect.stringContaining('stack_name=CagPlatform-production')
    });

    await expect(
      execFileAsync(
        process.execPath,
        [
          'scripts/deployment-target.mjs',
          '--stage',
          'production',
          '--ref',
          'master',
          '--ref-type',
          'tag'
        ],
        { cwd: process.cwd() }
      )
    ).rejects.toMatchObject({ code: 1 });
  });
});
