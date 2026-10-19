import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseCanaryTemplate } from './canary-iam-migration.js';

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid live canary IAM response or template object');
  }
  return value as Record<string, unknown>;
};

const canonical = (value: unknown, key = ''): string => {
  if (
    ['Action', 'NotAction', 'Resource', 'NotResource', 'Statement'].includes(
      key
    ) &&
    !Array.isArray(value)
  ) {
    value = [value];
  }
  // IAM statements, actions, resources and condition values are unordered sets.
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => canonical(item))
      .sort()
      .join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item, key)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
};

const document = (value: unknown) => {
  if (typeof value === 'string') {
    value = JSON.parse(
      value.trimStart().startsWith('{') ? value : decodeURIComponent(value)
    );
  }
  return object(value);
};

const equal = (actual: unknown, expected: unknown, label: string) => {
  if (canonical(actual) !== canonical(expected)) {
    throw new Error(`Live canary IAM drift in ${label}; refusing migration`);
  }
};

const list = (response: Record<string, unknown>, key: string): unknown[] => {
  if (response.IsTruncated === true || !Array.isArray(response[key])) {
    throw new Error(`Incomplete live canary IAM ${key} response`);
  }
  return response[key] as unknown[];
};

export const verifyCanaryIam = (
  template: ReturnType<typeof parseCanaryTemplate>,
  account: string,
  region: string,
  read: (args: string[]) => unknown = (args) =>
    JSON.parse(
      execFileSync(
        'aws',
        [
          ...args,
          '--region',
          region,
          '--output',
          'json',
          '--no-cli-pager',
          '--cli-connect-timeout',
          '10',
          '--cli-read-timeout',
          '20'
        ],
        { encoding: 'utf8', maxBuffer: 1024 * 1024, timeout: 30_000 }
      )
    )
): void => {
  if (!/^\d{12}$/.test(account) || !/^[a-z]{2}(?:-[a-z]+)+-\d+$/.test(region)) {
    throw new Error('Expected a twelve-digit AWS account and workload region');
  }
  const parameters = Object.fromEntries(
    Object.entries(object(template.Parameters)).map(([key, value]) => [
      key,
      object(value).Default
    ])
  );
  const references: Record<string, unknown> = {
    ...parameters,
    'AWS::AccountId': account,
    'AWS::Partition': 'aws',
    'AWS::Region': region
  };
  const reference = (name: string, values = references): unknown => {
    if (!Object.hasOwn(values, name) || values[name] === undefined) {
      throw new Error(`Unresolved canary template reference: ${name}`);
    }
    return values[name];
  };
  const resolve = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(resolve);
    if (!value || typeof value !== 'object') return value;
    const entries = object(value);
    if (Object.hasOwn(entries, 'Ref')) {
      return reference(String(entries.Ref));
    }
    if (Object.hasOwn(entries, 'Fn::Sub')) {
      const sub = entries['Fn::Sub'];
      const [pattern, variables] = Array.isArray(sub) ? sub : [sub, {}];
      if (typeof pattern !== 'string')
        throw new Error('Invalid canary Fn::Sub');
      const values = { ...references, ...object(resolve(variables)) };
      return pattern.replace(/\$\{([^}]+)\}/g, (_, name: string) => {
        const replacement = reference(name, values);
        if (
          typeof replacement !== 'string' &&
          typeof replacement !== 'number'
        ) {
          throw new Error(`Unsupported canary substitution value: ${name}`);
        }
        return String(replacement);
      });
    }
    if (Object.keys(entries).some((key) => key.startsWith('Fn::'))) {
      throw new Error('Unsupported canary template intrinsic');
    }
    return Object.fromEntries(
      Object.entries(entries).map(([key, item]) => [key, resolve(item)])
    );
  };
  // Resolve the entire expected inventory before reading AWS; unsupported input fails closed.
  const resources = Object.entries(template.Resources).map(
    ([id, resource]) => ({
      id,
      type: resource.Type,
      properties: object(resolve(resource.Properties))
    })
  );
  const iam = (operation: string, ...args: string[]) =>
    object(read(['iam', operation, ...args]));
  for (const { id, type, properties } of resources) {
    if (type === 'AWS::IAM::Role') {
      const name = String(properties.RoleName);
      const path = properties.Path ?? '/';
      const roleArgs = ['--role-name', name];
      const role = object(iam('get-role', ...roleArgs).Role);
      equal(role.RoleName, name, `${id} role name`);
      equal(role.Path, path, `${id} role path`);
      equal(
        role.Arn,
        `arn:aws:iam::${account}:role${path}${name}`,
        `${id} role ARN`
      );
      equal(
        document(role.AssumeRolePolicyDocument),
        document(properties.AssumeRolePolicyDocument),
        `${id} trust policy`
      );
      equal(
        role.PermissionsBoundary === undefined
          ? undefined
          : object(role.PermissionsBoundary).PermissionsBoundaryArn,
        properties.PermissionsBoundary,
        `${id} permissions boundary`
      );
      if (
        properties.PermissionsBoundary === undefined &&
        role.PermissionsBoundary !== undefined
      ) {
        throw new Error(
          `Live canary IAM drift in ${id} permissions boundary; refusing migration`
        );
      }
      const policies = (properties.Policies ?? []) as Record<string, unknown>[];
      equal(
        list(iam('list-role-policies', ...roleArgs), 'PolicyNames'),
        policies.map((policy) => policy.PolicyName),
        `${id} inline policy names`
      );
      for (const policy of policies) {
        const live = iam(
          'get-role-policy',
          ...roleArgs,
          '--policy-name',
          String(policy.PolicyName)
        );
        equal(
          document(live.PolicyDocument),
          document(policy.PolicyDocument),
          `${id} inline policy ${policy.PolicyName}`
        );
      }
      equal(
        list(
          iam('list-attached-role-policies', ...roleArgs),
          'AttachedPolicies'
        ).map((policy) => object(policy).PolicyArn),
        properties.ManagedPolicyArns ?? [],
        `${id} managed policy attachments`
      );
    } else if (type === 'AWS::IAM::ManagedPolicy') {
      const name = String(properties.ManagedPolicyName);
      const path = properties.Path ?? '/';
      const arn = `arn:aws:iam::${account}:policy${path}${name}`;
      const policy = object(iam('get-policy', '--policy-arn', arn).Policy);
      equal(policy.Arn, arn, `${id} policy ARN`);
      equal(policy.PolicyName, name, `${id} policy name`);
      equal(policy.Path, path, `${id} policy path`);
      equal(
        policy.Description,
        properties.Description,
        `${id} policy description`
      );
      if (
        typeof policy.DefaultVersionId !== 'string' ||
        !/^v\d+$/.test(policy.DefaultVersionId)
      ) {
        throw new Error(`Invalid live canary IAM default version for ${id}`);
      }
      const version = object(
        iam(
          'get-policy-version',
          '--policy-arn',
          arn,
          '--version-id',
          policy.DefaultVersionId
        ).PolicyVersion
      );
      equal(
        version.VersionId,
        policy.DefaultVersionId,
        `${id} default policy version`
      );
      equal(
        version.IsDefaultVersion,
        true,
        `${id} default policy version status`
      );
      equal(
        document(version.Document),
        document(properties.PolicyDocument),
        `${id} default policy document`
      );
      // Other roles (including CDK cfnexec) may legitimately attach this policy.
    } else {
      throw new Error(`Unsupported canary resource type: ${type}`);
    }
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [file, account, region, extra] = process.argv.slice(2);
  if (!file || !account || !region || extra) {
    throw new Error(
      'Usage: verify-canary-iam.ts <repository-template> <account-id> <workload-region>'
    );
  }
  verifyCanaryIam(
    parseCanaryTemplate(readFileSync(file, 'utf8')),
    account,
    region
  );
}
