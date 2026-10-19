import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import {
  assertCanaryParameters,
  assertCanaryProperties,
  assertCanaryRetained,
  assertCanaryTarget,
  createCanaryImportTemplate,
  parseCanaryTemplate
} from '../bootstrap/canary-iam-migration.js';

const repositoryTemplate = () =>
  parseCanaryTemplate(
    readFileSync(join(process.cwd(), 'bootstrap/canary-iam.yaml'), 'utf8')
  );
const retainedTemplate = () => {
  const template = repositoryTemplate();
  Object.values(template.Resources).forEach((resource) => {
    resource.DeletionPolicy = 'Retain';
    resource.UpdateReplacePolicy = 'Retain';
  });
  return template;
};

describe('canary IAM migration safeguards', () => {
  it('normalizes YAML and JSON GetTemplate bodies to the same resource properties', () => {
    const template = repositoryTemplate();
    const fromString = parseCanaryTemplate(
      JSON.stringify({
        TemplateBody: readFileSync(
          join(process.cwd(), 'bootstrap/canary-iam.yaml'),
          'utf8'
        )
      })
    );
    const fromObject = parseCanaryTemplate(
      JSON.stringify({ TemplateBody: template })
    );
    expect(() => assertCanaryProperties(fromString, fromObject)).not.toThrow();
  });

  it.each(['{broken', 'Resources: [', '{"TemplateBody":null}', 'no resources'])(
    'rejects malformed or empty templates: %s',
    (body) => {
      expect(() => parseCanaryTemplate(body)).toThrow();
    }
  );

  it('rejects source parameter overrides before applying defaults during import', () => {
    const template = repositoryTemplate();
    const parameters = Object.entries(
      template.Parameters as Record<string, { Default: string }>
    ).map(([ParameterKey, parameter]) => ({
      ParameterKey,
      ParameterValue: parameter.Default
    }));
    expect(() => assertCanaryParameters(parameters, template)).not.toThrow();
    parameters[
      parameters.findIndex(
        (parameter) => parameter.ParameterKey === 'WorkloadRegion'
      )
    ].ParameterValue = 'us-east-2';
    expect(() => assertCanaryParameters(parameters, template)).toThrow(
      /parameter drift/
    );
  });

  it('rejects source IAM drift while accepting retention and metadata changes', () => {
    const live = retainedTemplate();
    live.Resources.CanaryCloudFormationExecutionPolicy.Metadata = {
      DeliveryRegion: 'old'
    };
    expect(() =>
      assertCanaryProperties(live, repositoryTemplate())
    ).not.toThrow();
    live.Resources.CanaryPlanRole.Properties.RoleName = 'UnexpectedRole';
    expect(() => assertCanaryProperties(live, repositoryTemplate())).toThrow(
      /drift/
    );
  });

  it('requires exactly the four expected types and both retention attributes', () => {
    const template = retainedTemplate();
    expect(() => assertCanaryRetained(template)).not.toThrow();
    delete template.Resources.CanaryPlanRole.UpdateReplacePolicy;
    expect(() =>
      assertCanaryRetained(parseCanaryTemplate(JSON.stringify(template)))
    ).toThrow(/Retain/);
    template.Resources.CanaryPlanRole.UpdateReplacePolicy = 'Retain';
    delete template.Resources.CanaryDestroyRole;
    expect(() => assertCanaryRetained(template)).toThrow(/four/);
    template.Resources.CanaryDestroyRole = template.Resources.CanaryPlanRole;
    template.Resources.CanaryPlanRole.Type = 'AWS::IAM::User';
    expect(() => assertCanaryRetained(template)).toThrow(/type/);
  });

  it('imports without Outputs and forces a later metadata update to restore them', () => {
    const template = createCanaryImportTemplate(retainedTemplate());
    expect(template.Outputs).toBeUndefined();
    expect(
      template.Resources.CanaryCloudFormationExecutionPolicy.Metadata
    ).toEqual({ DeliveryRegion: 'importing' });
    expect(() => assertCanaryRetained(template)).not.toThrow();
  });

  it('validates all target physical IDs before treating a completed stack as migrated', () => {
    const resources = [
      [
        'CanaryCloudFormationExecutionPolicy',
        'AWS::IAM::ManagedPolicy',
        'arn:aws:iam::123456789012:policy/CagCanaryCloudFormationExecution'
      ],
      ['CanaryPlanRole', 'AWS::IAM::Role', 'CagGithubCanaryPlanRole'],
      ['CanaryDeployRole', 'AWS::IAM::Role', 'CagGithubCanaryDeployRole'],
      ['CanaryDestroyRole', 'AWS::IAM::Role', 'CagGithubCanaryDestroyRole']
    ].map(([LogicalResourceId, ResourceType, PhysicalResourceId]) => ({
      LogicalResourceId,
      ResourceType,
      PhysicalResourceId
    }));
    expect(() =>
      assertCanaryTarget({ StackResourceSummaries: resources }, '123456789012')
    ).not.toThrow();
    resources[2].PhysicalResourceId = 'UnrelatedRole';
    expect(() =>
      assertCanaryTarget({ StackResourceSummaries: resources }, '123456789012')
    ).toThrow(/physical/);
  });
});

const runMigration = (scenario: string) => {
  const directory = mkdtempSync(join(tmpdir(), 'cag-iam-flow-'));
  const template = retainedTemplate();
  const resources = [
    [
      'CanaryCloudFormationExecutionPolicy',
      'AWS::IAM::ManagedPolicy',
      'arn:aws:iam::123456789012:policy/CagCanaryCloudFormationExecution'
    ],
    ['CanaryPlanRole', 'AWS::IAM::Role', 'CagGithubCanaryPlanRole'],
    ['CanaryDeployRole', 'AWS::IAM::Role', 'CagGithubCanaryDeployRole'],
    ['CanaryDestroyRole', 'AWS::IAM::Role', 'CagGithubCanaryDestroyRole']
  ].map(([LogicalResourceId, ResourceType, PhysicalResourceId]) => ({
    LogicalResourceId,
    ResourceType,
    PhysicalResourceId
  }));
  writeFileSync(
    join(directory, 'fixture.json'),
    JSON.stringify({ template, resources, scenario })
  );
  const fakeAws = join(directory, 'aws');
  writeFileSync(
    fakeAws,
    `#!${process.execPath}
const fs = require('node:fs');
const dir = process.env.CAG_MIGRATION_FIXTURE;
const fixture = JSON.parse(fs.readFileSync(dir + '/fixture.json', 'utf8'));
const args = process.argv.slice(2);
fs.appendFileSync(dir + '/calls.jsonl', JSON.stringify(args) + String.fromCharCode(10));
const value = flag => args[args.indexOf(flag) + 1];
const output = value => process.stdout.write(typeof value === 'string' ? value : JSON.stringify(value));
let state;
try { state = JSON.parse(fs.readFileSync(dir + '/state.json', 'utf8')); }
catch { state = { oldExists: !['partial', 'complete', 'rollback', 'importing'].includes(fixture.scenario), updated: false, imported: fixture.scenario === 'complete' }; }
const save = () => fs.writeFileSync(dir + '/state.json', JSON.stringify(state));
const fail = message => { process.stderr.write(message); process.exit(1); };
if (args[0] === 'sts') { output(fixture.scenario === 'account' ? '999999999999' : '123456789012'); process.exit(0); }
const command = args[1];
const old = value('--region') === 'us-east-2';
if (command === 'describe-stacks') {
  if (value('--query') === 'Stacks[0].Parameters') {
    const parameters = Object.entries(fixture.template.Parameters).map(([ParameterKey, item]) => ({ ParameterKey, ParameterValue: item.Default }));
    if (fixture.scenario === 'parameters') parameters[0].ParameterValue = 'UnrelatedOrganization';
    output(parameters); process.exit(0);
  }
  if (fixture.scenario === 'denied') fail('An error occurred (AccessDenied) when calling DescribeStacks');
  if (fixture.scenario === 'network') fail('Could not connect to endpoint URL');
  if (old && state.oldExists) output('UPDATE_COMPLETE');
  else if (!old && state.imported) output('IMPORT_COMPLETE');
  else if (!old && fixture.scenario === 'partial') output('REVIEW_IN_PROGRESS');
  else if (!old && fixture.scenario === 'rollback') output('IMPORT_ROLLBACK_COMPLETE');
  else if (!old && fixture.scenario === 'importing') output('IMPORT_IN_PROGRESS');
  else fail('An error occurred (ValidationError) when calling DescribeStacks: Stack with id CagGithubCanaryDelivery does not exist');
} else if (command === 'get-template') {
  const body = structuredClone(fixture.template);
  if (!state.updated || fixture.scenario === 'guard') {
    for (const resource of Object.values(body.Resources)) { delete resource.DeletionPolicy; delete resource.UpdateReplacePolicy; delete resource.Metadata; }
  }
  if (fixture.scenario === 'drift') body.Resources.CanaryPlanRole.Properties.RoleName = 'UnexpectedRole';
  output({ TemplateBody: state.updated ? JSON.stringify(body) : body });
} else if (command === 'deploy') { state.updated = true; save(); }
else if (command === 'delete-stack') { state.oldExists = false; save(); }
else if (command === 'create-change-set') {
  const body = JSON.parse(fs.readFileSync(value('--template-body').slice(7), 'utf8'));
  if (body.Outputs || body.Resources.CanaryCloudFormationExecutionPolicy.Metadata.DeliveryRegion !== 'importing') fail('Unsafe import template');
  const resources = JSON.parse(value('--resources-to-import'));
  if (resources.length !== 4 || !resources[0].ResourceIdentifier.PolicyArn) fail('Invalid import identifiers');
} else if (command === 'execute-change-set') { state.imported = true; save(); }
else if (command === 'list-stack-resources') output({ StackResourceSummaries: fixture.resources });
else if (command === 'wait') { if (args[2] === 'stack-import-complete') { state.imported = true; save(); } }
else fail('Unexpected AWS command: ' + args.join(' '));
`
  );
  chmodSync(fakeAws, 0o755);
  try {
    const result = spawnSync(
      'bash',
      [join(process.cwd(), 'bootstrap/move-canary-iam.sh')],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          AWS_ACCOUNT_ID: '123456789012',
          AWS_REGION: 'us-east-1',
          CAG_MIGRATION_FIXTURE: directory,
          PATH: `${directory}:${process.env.PATH}`
        }
      }
    );
    const calls = readFileSync(join(directory, 'calls.jsonl'), 'utf8')
      .trim()
      .split(String.fromCharCode(10))
      .map((line) => JSON.parse(line) as string[]);
    return { ...result, calls };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

describe('canary IAM migration shell flow', () => {
  it.each([
    'account',
    'denied',
    'network',
    'drift',
    'guard',
    'parameters',
    'rollback'
  ])('fails closed for %s without deleting the source stack', (scenario) => {
    const result = runMigration(scenario);
    expect(result.status, result.stderr).not.toBe(0);
    const errors: Record<string, RegExp> = {
      account: /account mismatch/,
      denied: /AccessDenied/,
      network: /Could not connect/,
      drift: /template drift/,
      guard: /both Retain/,
      parameters: /parameter drift/,
      rollback: /IMPORT_ROLLBACK_COMPLETE/
    };
    expect(result.stderr).toMatch(errors[scenario]);
    expect(result.calls.some((call) => call[1] === 'delete-stack')).toBe(false);
    expect(result.calls.some((call) => call[1] === 'create-change-set')).toBe(
      false
    );
  });

  it('checks live retention immediately before deleting, then imports all resources', () => {
    const result = runMigration('normal');
    expect(result.status, result.stderr).toBe(0);
    const actions = result.calls.map((call) => call[1]);
    expect(
      actions.slice(
        actions.indexOf('deploy'),
        actions.indexOf('delete-stack') + 1
      )
    ).toEqual(['deploy', 'get-template', 'delete-stack']);
    expect(actions).toContain('create-change-set');
    expect(actions).toContain('execute-change-set');
    expect(actions.at(-1)).toBe('list-stack-resources');
  });

  it('resumes an interrupted import without recreating or deleting IAM resources', () => {
    const result = runMigration('partial');
    expect(result.status, result.stderr).toBe(0);
    expect(result.calls.some((call) => call[1] === 'create-change-set')).toBe(
      true
    );
    expect(
      result.calls.some((call) => ['deploy', 'delete-stack'].includes(call[1]))
    ).toBe(false);
  });

  it.each(['complete', 'importing'])(
    'validates and skips a %s target',
    (scenario) => {
      const result = runMigration(scenario);
      expect(result.status, result.stderr).toBe(0);
      expect(result.calls.at(-1)?.[1]).toBe('list-stack-resources');
      expect(
        result.calls.some((call) =>
          [
            'deploy',
            'delete-stack',
            'create-change-set',
            'execute-change-set'
          ].includes(call[1])
        )
      ).toBe(false);
    }
  );
});
