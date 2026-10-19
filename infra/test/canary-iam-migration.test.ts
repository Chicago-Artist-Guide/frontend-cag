import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import {
  assertCanaryEmptyTarget,
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
  it('only permits removing an empty rolled-back import placeholder', () => {
    const empty = JSON.stringify({ TemplateBody: { Resources: {} } });
    const removed = {
      StackResourceSummaries: [
        {
          LogicalResourceId: 'CanaryPlanRole',
          ResourceType: 'AWS::IAM::Role',
          PhysicalResourceId: 'CagGithubCanaryPlanRole',
          ResourceStatus: 'IMPORT_ROLLBACK_COMPLETE'
        }
      ]
    };
    expect(() =>
      assertCanaryEmptyTarget(empty, removed, '123456789012')
    ).not.toThrow();
    removed.StackResourceSummaries[0].ResourceStatus = 'IMPORT_COMPLETE';
    expect(() =>
      assertCanaryEmptyTarget(empty, removed, '123456789012')
    ).toThrow(/active/);
    removed.StackResourceSummaries[0].ResourceStatus =
      'IMPORT_ROLLBACK_COMPLETE';
    removed.StackResourceSummaries[0].PhysicalResourceId = 'UnexpectedRole';
    expect(() =>
      assertCanaryEmptyTarget(empty, removed, '123456789012')
    ).toThrow(/physical/);
    expect(() =>
      assertCanaryEmptyTarget(
        JSON.stringify(repositoryTemplate()),
        { StackResourceSummaries: [] },
        '123456789012'
      )
    ).toThrow(/empty/);
  });

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

const runMigration = async (scenario: string) => {
  const directory = mkdtempSync(join(tmpdir(), 'cag-iam-flow-'));
  const template = retainedTemplate();
  const deployedTemplate = structuredClone(template);
  if (scenario.includes('policy-update')) {
    const policy = deployedTemplate.Resources
      .CanaryCloudFormationExecutionPolicy.Properties.PolicyDocument as {
      Statement: { Action: string[] }[];
    };
    const networking = policy.Statement.find((statement) =>
      statement.Action.includes('ec2:CreateVpc')
    );
    if (!networking)
      throw new Error('Missing networking policy in test fixture');
    networking.Action = networking.Action.filter(
      (action) => action !== 'ec2:CreateVpc'
    );
  }
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
  if (scenario === 'complete-policy-update-identity')
    resources[0].PhysicalResourceId = 'UnexpectedPolicy';
  writeFileSync(
    join(directory, 'fixture.json'),
    JSON.stringify({
      deployedTemplate,
      template,
      liveTemplate: structuredClone(
        scenario === 'complete-policy-update-live-drift'
          ? template
          : deployedTemplate
      ),
      resources,
      scenario
    })
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
catch { state = { oldExists: !fixture.scenario.startsWith('complete-policy-update') && fixture.scenario !== 'importing-policy-update' && !['partial', 'complete', 'rollback', 'importing', 'target-update-rollback', 'placeholder-delete-once'].includes(fixture.scenario), updated: false, imported: fixture.scenario.startsWith('complete-policy-update') || ['complete', 'target-update-rollback'].includes(fixture.scenario), targetStatus: fixture.scenario === 'placeholder-delete-once' ? 'IMPORT_ROLLBACK_COMPLETE' : undefined }; }
const save = () => fs.writeFileSync(dir + '/state.json', JSON.stringify(state));
const fail = message => { process.stderr.write(message); process.exit(1); };
if (args[0] === 'sts') { output(fixture.scenario === 'account' ? '999999999999' : '123456789012'); process.exit(0); }
if (args[0] === 'iam') {
  if (fixture.scenario === 'live-denied') fail('AccessDenied reading live IAM');
  const variables = Object.fromEntries(Object.entries(fixture.liveTemplate.Parameters).map(([key, item]) => [key, item.Default]));
  Object.assign(variables, {'AWS::Partition':'aws', 'AWS::AccountId':'123456789012', 'AWS::Region':'us-east-1'});
  const resolve = value => {
    if (Array.isArray(value)) return value.map(resolve);
    if (!value || typeof value !== 'object') return value;
    if (value.Ref) return variables[value.Ref];
    if (typeof value['Fn::Sub'] === 'string') {
      let text = value['Fn::Sub'];
      for (const [key, item] of Object.entries(variables)) text = text.split('$' + '{' + key + '}').join(item);
      return text;
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item)]));
  };
  const actual = resolve(fixture.liveTemplate);
  const role = Object.values(actual.Resources).find(resource => resource.Properties.RoleName === value('--role-name'))?.Properties;
  if (fixture.scenario === 'live-policy-drift' || (fixture.scenario === 'post-import-drift' && state.imported)) actual.Resources.CanaryDeployRole.Properties.Policies[0].PolicyDocument.Statement[0].Resource = '*';
  if (fixture.scenario === 'live-trust-drift') actual.Resources.CanaryDeployRole.Properties.AssumeRolePolicyDocument.Statement[0].Condition.StringEquals['token.actions.githubusercontent.com:sub'] = 'repo:attacker/repo:environment:canary';
  const operation = args[1];
  if (operation === 'get-role') output({Role:{...role, Arn:'arn:aws:iam::123456789012:role/' + role.RoleName, Path:'/'}});
  else if (operation === 'list-role-policies') output({PolicyNames:role.Policies.map(policy => policy.PolicyName)});
  else if (operation === 'get-role-policy') output({PolicyDocument:role.Policies.find(policy => policy.PolicyName === value('--policy-name')).PolicyDocument});
  else if (operation === 'list-attached-role-policies') output({AttachedPolicies:[]});
  else if (operation === 'get-policy') output({Policy:{Arn:value('--policy-arn'), PolicyName:'CagCanaryCloudFormationExecution', Path:'/', Description:actual.Resources.CanaryCloudFormationExecutionPolicy.Properties.Description, DefaultVersionId:'v1'}});
  else if (operation === 'get-policy-version') output({PolicyVersion:{VersionId:'v1', IsDefaultVersion:true, Document:actual.Resources.CanaryCloudFormationExecutionPolicy.Properties.PolicyDocument}});
  else fail('Unexpected IAM operation: ' + operation);
  process.exit(0);
}

const command = args[1];
const old = value('--region') === 'us-east-2';
if (command === 'describe-stacks') {
  if (value('--query') === 'Stacks[0].Parameters') {
    const parameters = Object.entries(fixture.template.Parameters).map(([ParameterKey, item]) => ({ ParameterKey, ParameterValue: item.Default }));
    if (['parameters', 'complete-policy-update-parameters'].includes(fixture.scenario)) parameters[0].ParameterValue = 'UnrelatedOrganization';
    output(parameters); process.exit(0);
  }
  if (fixture.scenario === 'denied') fail('An error occurred (AccessDenied) when calling DescribeStacks');
  if (fixture.scenario === 'network') fail('Could not connect to endpoint URL');
  if (old && state.oldExists) output(state.sourceStatus || 'UPDATE_COMPLETE');
  else if (!old && state.targetStatus) output(state.targetStatus);
  else if (!old && state.imported) output(fixture.scenario === 'target-update-rollback' ? 'UPDATE_ROLLBACK_COMPLETE' : 'IMPORT_COMPLETE');
  else if (!old && fixture.scenario === 'partial') output('REVIEW_IN_PROGRESS');
  else if (!old && fixture.scenario === 'rollback') output('IMPORT_ROLLBACK_COMPLETE');
  else if (!old && ['importing', 'importing-policy-update'].includes(fixture.scenario)) output('IMPORT_IN_PROGRESS');
  else fail('An error occurred (ValidationError) when calling DescribeStacks: Stack with id CagGithubCanaryDelivery does not exist');
} else if (command === 'get-template') {
  const body = structuredClone(fixture.deployedTemplate);
  if (!old && state.targetStatus === 'IMPORT_ROLLBACK_COMPLETE') { output({TemplateBody:{Resources:{}}}); process.exit(0); }
  if (old && (!state.updated || fixture.scenario === 'guard')) {
    for (const resource of Object.values(body.Resources)) { delete resource.DeletionPolicy; delete resource.UpdateReplacePolicy; delete resource.Metadata; }
  }
  if (fixture.scenario === 'drift') body.Resources.CanaryPlanRole.Properties.RoleName = 'UnexpectedRole';
  if (fixture.scenario === 'complete-policy-update-retention') delete body.Resources.CanaryPlanRole.DeletionPolicy;
  output({ TemplateBody: state.updated ? JSON.stringify(body) : body });
} else if (command === 'deploy') {
  if (fixture.scenario === 'source-rollback-once' && !state.failedUpdate) {
    state.failedUpdate = true; state.sourceStatus = 'UPDATE_ROLLBACK_COMPLETE'; save(); fail('Simulated update rollback');
  }
  state.updated = true; state.sourceStatus = 'UPDATE_COMPLETE'; save();
}
else if (command === 'delete-stack') {
  if (!old && fixture.scenario === 'placeholder-delete-once' && !state.deleteInterrupted) {
    state.deleteInterrupted = true; state.targetStatus = 'DELETE_IN_PROGRESS'; save(); fail('Interrupted placeholder deletion');
  }
  if (old) state.oldExists = false; else delete state.targetStatus; save();
}
else if (command === 'create-change-set') {
  const body = JSON.parse(fs.readFileSync(value('--template-body').slice(7), 'utf8'));
  if (body.Outputs || body.Resources.CanaryCloudFormationExecutionPolicy.Metadata.DeliveryRegion !== 'importing') fail('Unsafe import template');
  const resources = JSON.parse(value('--resources-to-import'));
  if (resources.length !== 4 || !resources[0].ResourceIdentifier.PolicyArn) fail('Invalid import identifiers');
} else if (command === 'execute-change-set') {
  if (fixture.scenario === 'import-rollback-once' && !state.failedImport) {
    state.failedImport = true; state.targetStatus = 'IMPORT_ROLLBACK_COMPLETE'; save(); fail('Simulated import rollback');
  }
  state.imported = true; delete state.targetStatus; save();
}
else if (command === 'list-stack-resources') output({ StackResourceSummaries: state.targetStatus === 'IMPORT_ROLLBACK_COMPLETE' ? [] : fixture.resources });
else if (command === 'wait') { if (args[2] === 'stack-import-complete') { state.imported = true; save(); } if (!old && args[2] === 'stack-delete-complete') { delete state.targetStatus; save(); } }
else fail('Unexpected AWS command: ' + args.join(' '));
`
  );
  chmodSync(fakeAws, 0o755);
  try {
    // Yield while Bash runs so Vitest can receive worker RPC acknowledgements.
    const run = () =>
      new Promise<{ status: number | null; stderr: string }>(
        (resolve, reject) => {
          const child = spawn(
            'bash',
            [join(process.cwd(), 'bootstrap/move-canary-iam.sh')],
            {
              stdio: ['ignore', 'ignore', 'pipe'],
              env: {
                ...process.env,
                AWS_ACCOUNT_ID: '123456789012',
                AWS_REGION: 'us-east-1',
                CAG_MIGRATION_FIXTURE: directory,
                PATH: `${directory}:${process.env.PATH}`
              }
            }
          );
          let stderr = '';
          child.stderr.setEncoding('utf8');
          child.stderr.on('data', (chunk: string) => {
            stderr += chunk;
          });
          child.once('error', reject);
          child.once('close', (status) => resolve({ status, stderr }));
        }
      );
    const first = await run();
    const result = scenario.endsWith('-once') ? await run() : first;
    const calls = readFileSync(join(directory, 'calls.jsonl'), 'utf8')
      .trim()
      .split(String.fromCharCode(10))
      .map((line) => JSON.parse(line) as string[]);
    return { ...result, calls, firstStatus: first.status };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

describe('canary IAM migration shell flow', () => {
  it('permits a reviewed policy update after verifying the completed target against its deployed template', async () => {
    const result = await runMigration('complete-policy-update');
    expect(result.status, result.stderr).toBe(0);
    expect(result.calls.some((call) => call[1] === 'get-policy-version')).toBe(
      true
    );
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
  });

  it('rejects completed-target IAM drift even when the live policy already matches the desired template', async () => {
    const result = await runMigration('complete-policy-update-live-drift');
    expect(result.status, result.stderr).not.toBe(0);
    expect(result.stderr).toMatch(/live canary IAM drift/i);
    expect(result.calls.some((call) => call[1] === 'delete-stack')).toBe(false);
  });

  it.each([
    ['identity', /physical/],
    ['retention', /both Retain/],
    ['parameters', /parameter drift/]
  ])(
    'keeps the completed-target %s safeguard during a policy update',
    async (guard, error) => {
      const result = await runMigration(`complete-policy-update-${guard}`);
      expect(result.status, result.stderr).not.toBe(0);
      expect(result.stderr).toMatch(error);
      expect(result.calls.some((call) => call[1] === 'delete-stack')).toBe(
        false
      );
    }
  );

  it('still checks desired properties when resuming an unfinished import', async () => {
    const result = await runMigration('importing-policy-update');
    expect(result.status, result.stderr).not.toBe(0);
    expect(result.stderr).toMatch(/template drift/i);
    expect(
      result.calls.some(
        (call) => call[1] === 'wait' && call[2] === 'stack-import-complete'
      )
    ).toBe(true);
    expect(result.calls.some((call) => call[1] === 'delete-stack')).toBe(false);
  });

  it('still rejects policy changes before the source stack has been migrated', async () => {
    const result = await runMigration('source-policy-update');
    expect(result.status, result.stderr).not.toBe(0);
    expect(result.stderr).toMatch(/template drift/i);
    expect(result.calls.some((call) => call[1] === 'delete-stack')).toBe(false);
    expect(result.calls.some((call) => call[1] === 'create-change-set')).toBe(
      false
    );
  });

  it('resumes while the empty rollback placeholder deletion is still in progress', async () => {
    const result = await runMigration('placeholder-delete-once');
    expect(result.firstStatus).not.toBe(0);
    expect(result.status, result.stderr).toBe(0);
    expect(
      result.calls.filter((call) => call[1] === 'delete-stack')
    ).toHaveLength(1);
    expect(result.calls.some((call) => call[1] === 'execute-change-set')).toBe(
      true
    );
  });

  it('rejects live IAM drift introduced after the import', async () => {
    const result = await runMigration('post-import-drift');
    expect(result.status, result.stderr).not.toBe(0);
    expect(result.stderr).toMatch(/drift/i);
    expect(result.calls.some((call) => call[1] === 'execute-change-set')).toBe(
      true
    );
  });

  it.each(['source-rollback-once', 'import-rollback-once'])(
    'recovers a failed %s on the next invocation using persisted service state',
    async (scenario) => {
      const result = await runMigration(scenario);
      expect(result.firstStatus).not.toBe(0);
      expect(result.status, result.stderr).toBe(0);
      expect(
        result.calls.filter(
          (call) => call[1] === 'delete-stack' && call.includes('us-east-2')
        )
      ).toHaveLength(1);
    }
  );

  it.each([
    'account',
    'denied',
    'network',
    'drift',
    'guard',
    'parameters',
    'live-policy-drift',
    'live-trust-drift',
    'live-denied',
    'rollback'
  ])(
    'fails closed for %s without deleting the source stack',
    async (scenario) => {
      const result = await runMigration(scenario);
      expect(result.status, result.stderr).not.toBe(0);
      const errors: Record<string, RegExp> = {
        account: /account mismatch/,
        denied: /AccessDenied/,
        network: /Could not connect/,
        drift: /template drift/,
        guard: /both Retain/,
        parameters: /parameter drift/,
        'live-policy-drift': /drift/i,
        'live-trust-drift': /drift/i,
        'live-denied': /AccessDenied/,
        rollback: /empty/
      };
      expect(result.stderr).toMatch(errors[scenario]);
      expect(result.calls.some((call) => call[1] === 'delete-stack')).toBe(
        false
      );
      expect(result.calls.some((call) => call[1] === 'create-change-set')).toBe(
        false
      );
    }
  );

  it('checks live retention immediately before deleting, then imports all resources', async () => {
    const result = await runMigration('normal');
    expect(result.status, result.stderr).toBe(0);
    const actions = result.calls
      .filter((call) => call[0] === 'cloudformation')
      .map((call) => call[1]);
    expect(
      actions.slice(
        actions.indexOf('deploy'),
        actions.indexOf('delete-stack') + 1
      )
    ).toEqual(['deploy', 'get-template', 'delete-stack']);
    expect(actions).toContain('create-change-set');
    expect(actions).toContain('execute-change-set');
    expect(result.calls.some((call) => call[1] === 'get-policy-version')).toBe(
      true
    );
  });

  it('resumes an interrupted import without recreating or deleting IAM resources', async () => {
    const result = await runMigration('partial');
    expect(result.status, result.stderr).toBe(0);
    expect(result.calls.some((call) => call[1] === 'create-change-set')).toBe(
      true
    );
    expect(
      result.calls.some((call) => ['deploy', 'delete-stack'].includes(call[1]))
    ).toBe(false);
  });

  it.each(['complete', 'importing', 'target-update-rollback'])(
    'validates and skips a %s target',
    async (scenario) => {
      const result = await runMigration(scenario);
      expect(result.status, result.stderr).toBe(0);
      expect(
        result.calls.some((call) => call[1] === 'list-stack-resources')
      ).toBe(true);
      expect(
        result.calls.some((call) => call[1] === 'get-policy-version')
      ).toBe(true);
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
