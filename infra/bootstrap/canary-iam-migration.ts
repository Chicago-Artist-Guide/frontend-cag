import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { App, BootstraplessSynthesizer, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';

type Resource = {
  Type: string;
  Properties: Record<string, unknown>;
  DeletionPolicy?: string;
  UpdateReplacePolicy?: string;
  Metadata?: Record<string, unknown>;
};
type CanaryTemplate = {
  Resources: Record<string, Resource>;
  Outputs?: unknown;
  [key: string]: unknown;
};
const expectedResources = {
  CanaryCloudFormationExecutionPolicy: 'AWS::IAM::ManagedPolicy',
  CanaryPlanRole: 'AWS::IAM::Role',
  CanaryDeployRole: 'AWS::IAM::Role',
  CanaryDestroyRole: 'AWS::IAM::Role'
};

export const parseCanaryTemplate = (body: string): CanaryTemplate => {
  if (body.trimStart().startsWith('{')) {
    const parsed = JSON.parse(body);
    if (Object.hasOwn(parsed, 'TemplateBody')) {
      if (
        !parsed.TemplateBody ||
        !['object', 'string'].includes(typeof parsed.TemplateBody)
      ) {
        throw new Error('Invalid GetTemplate TemplateBody');
      }
      body =
        typeof parsed.TemplateBody === 'string'
          ? parsed.TemplateBody
          : JSON.stringify(parsed.TemplateBody);
    }
  }
  const directory = mkdtempSync(join(tmpdir(), 'cag-iam-template-'));
  try {
    const file = join(directory, 'template.yaml');
    writeFileSync(file, body);
    const stack = new Stack(
      new App({ outdir: join(directory, 'out') }),
      'Delivery',
      { analyticsReporting: false, synthesizer: new BootstraplessSynthesizer() }
    );
    new CfnInclude(stack, 'Included', { templateFile: file });
    const template = Template.fromStack(stack).toJSON() as CanaryTemplate;
    assertResources(template);
    return template;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

const assertResources = (template: CanaryTemplate) => {
  if (
    !template.Resources ||
    Object.keys(template.Resources).sort().join(',') !==
      Object.keys(expectedResources).sort().join(',')
  ) {
    throw new Error('Expected exactly the four canary IAM resources');
  }
  for (const [id, type] of Object.entries(expectedResources)) {
    if (template.Resources[id].Type !== type) {
      throw new Error(`Unexpected resource type for ${id}`);
    }
  }
};

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

export const assertCanaryProperties = (
  live: CanaryTemplate,
  repository: CanaryTemplate
) => {
  assertResources(live);
  assertResources(repository);
  for (const id of Object.keys(expectedResources)) {
    if (
      canonical(live.Resources[id].Properties) !==
      canonical(repository.Resources[id].Properties)
    ) {
      throw new Error(`Canary IAM template drift in ${id}; refusing migration`);
    }
  }
};

export const assertCanaryParameters = (
  result: unknown,
  repository: CanaryTemplate
) => {
  const parameters = result as {
    ParameterKey: string;
    ParameterValue: string;
  }[];
  const defaults = repository.Parameters as Record<string, { Default: string }>;
  if (
    !Array.isArray(parameters) ||
    parameters.length !== Object.keys(defaults).length
  ) {
    throw new Error(
      'Canary IAM parameter drift; expected all repository defaults'
    );
  }
  for (const [key, parameter] of Object.entries(defaults)) {
    const matches = parameters.filter((item) => item.ParameterKey === key);
    if (
      matches.length !== 1 ||
      matches[0].ParameterValue !== parameter.Default
    ) {
      throw new Error(
        `Canary IAM parameter drift in ${key}; refusing migration`
      );
    }
  }
};

export const assertCanaryRetained = (template: CanaryTemplate) => {
  assertResources(template);
  for (const [id, resource] of Object.entries(template.Resources)) {
    if (
      resource.DeletionPolicy !== 'Retain' ||
      resource.UpdateReplacePolicy !== 'Retain'
    ) {
      throw new Error(
        `${id} must have both Retain policies before deleting the source stack`
      );
    }
  }
};

export const createCanaryImportTemplate = (
  repository: CanaryTemplate
): CanaryTemplate => {
  assertCanaryRetained(repository);
  const template = structuredClone(repository);
  delete template.Outputs;
  template.Resources.CanaryCloudFormationExecutionPolicy.Metadata = {
    ...template.Resources.CanaryCloudFormationExecutionPolicy.Metadata,
    DeliveryRegion: 'importing'
  };
  return template;
};

export const assertCanaryTarget = (result: unknown, account: string) => {
  const resources = (
    result as {
      StackResourceSummaries?: {
        LogicalResourceId: string;
        ResourceType: string;
        PhysicalResourceId: string;
        ResourceStatus?: string;
      }[];
    }
  ).StackResourceSummaries;
  if (!Array.isArray(resources) || resources.length !== 4)
    throw new Error('Target must contain exactly four canary IAM resources');
  const physicalIds: Record<string, string> = {
    CanaryCloudFormationExecutionPolicy: `arn:aws:iam::${account}:policy/CagCanaryCloudFormationExecution`,
    CanaryPlanRole: 'CagGithubCanaryPlanRole',
    CanaryDeployRole: 'CagGithubCanaryDeployRole',
    CanaryDestroyRole: 'CagGithubCanaryDestroyRole'
  };
  for (const [id, type] of Object.entries(expectedResources)) {
    const matches = resources.filter(
      (resource) => resource.LogicalResourceId === id
    );
    if (
      matches.length !== 1 ||
      matches[0].ResourceType !== type ||
      matches[0].PhysicalResourceId !== physicalIds[id] ||
      matches[0].ResourceStatus === 'DELETE_COMPLETE'
    ) {
      throw new Error(`Unexpected target physical resource for ${id}`);
    }
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [operation, first, second] = process.argv.slice(2);
  if (operation === 'compare') {
    assertCanaryProperties(
      parseCanaryTemplate(readFileSync(first, 'utf8')),
      parseCanaryTemplate(readFileSync(second, 'utf8'))
    );
  } else if (operation === 'parameters') {
    assertCanaryParameters(
      JSON.parse(readFileSync(first, 'utf8')),
      parseCanaryTemplate(readFileSync(second, 'utf8'))
    );
  } else if (operation === 'guard') {
    assertCanaryRetained(parseCanaryTemplate(readFileSync(first, 'utf8')));
  } else if (operation === 'import') {
    process.stdout.write(
      JSON.stringify(
        createCanaryImportTemplate(
          parseCanaryTemplate(readFileSync(first, 'utf8'))
        )
      )
    );
  } else if (operation === 'target') {
    assertCanaryTarget(JSON.parse(readFileSync(first, 'utf8')), second);
  } else {
    throw new Error(`Unknown canary migration operation: ${operation}`);
  }
}
