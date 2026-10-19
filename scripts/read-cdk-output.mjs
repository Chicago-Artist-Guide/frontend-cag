/* eslint-env node */

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { isValidCagStackName } from './deployment-target.mjs';

const AWS_LOAD_BALANCER_HOSTNAME =
  /^(?=.{1,253}$)(?:internal-)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2}(?:-[a-z0-9]+)+-\d+\.elb\.amazonaws\.com(?:\.cn)?$/i;

const assertSingleLine = (value) => {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) {
    throw new Error('CDK output values must be single-line strings');
  }

  return value;
};

const optionalString = (outputs, name) => {
  const value = outputs[name];

  if (value === undefined) {
    return undefined;
  }

  return assertSingleLine(value);
};

export const validateApplicationUrl = (
  value,
  stackName,
  loadBalancerDnsName
) => {
  assertSingleLine(value);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('ApplicationUrl must be an absolute application origin');
  }
  const httpsNames = {
    'CagPlatform-production': [
      'prod.chicagoartistguide.org',
      'www.chicagoartistguide.org'
    ],
    'CagPlatform-canary': ['staging.chicagoartistguide.org']
  };
  if (
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    !(
      (url.protocol === 'http:' &&
        url.hostname === loadBalancerDnsName.toLowerCase()) ||
      (url.protocol === 'https:' &&
        (httpsNames[stackName] || []).includes(url.hostname))
    )
  ) {
    throw new Error(
      'ApplicationUrl must match the exact stack application origin'
    );
  }
  return url.origin;
};

export const readCdkOutputs = async (filePath, stackName) => {
  if (!isValidCagStackName(stackName)) {
    throw new Error(
      `${String(stackName)} is not a valid CAG platform stack name`
    );
  }

  let document;
  try {
    document = JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read CDK outputs file: ${message}`);
  }

  if (
    document === null ||
    typeof document !== 'object' ||
    Array.isArray(document) ||
    !Object.hasOwn(document, stackName)
  ) {
    throw new Error(
      `CDK outputs file does not contain exact stack ${stackName}`
    );
  }

  const outputs = document[stackName];
  if (
    outputs === null ||
    typeof outputs !== 'object' ||
    Array.isArray(outputs)
  ) {
    throw new Error(`CDK outputs for ${stackName} must be an object`);
  }

  const loadBalancerDnsName = outputs.LoadBalancerDnsName;
  if (
    typeof loadBalancerDnsName !== 'string' ||
    !AWS_LOAD_BALANCER_HOSTNAME.test(loadBalancerDnsName)
  ) {
    throw new Error(
      'LoadBalancerDnsName must be a valid AWS load balancer hostname'
    );
  }

  const normalizedLoadBalancerDnsName = loadBalancerDnsName.toLowerCase();

  return {
    baseUrl:
      outputs.ApplicationUrl === undefined
        ? `http://${normalizedLoadBalancerDnsName}`
        : validateApplicationUrl(
            outputs.ApplicationUrl,
            stackName,
            normalizedLoadBalancerDnsName
          ),
    dataSubnetIds: optionalString(outputs, 'DataSubnetIds'),
    deploymentId: optionalString(outputs, 'DeploymentId'),
    futureDataSecurityGroupId: optionalString(
      outputs,
      'FutureDataSecurityGroupId'
    ),
    loadBalancerDnsName: normalizedLoadBalancerDnsName,
    stackName,
    vpcId: optionalString(outputs, 'VpcId')
  };
};

export const formatCdkOutputs = (outputs) => {
  const lines = [
    ['base_url', outputs.baseUrl],
    ['load_balancer_dns_name', outputs.loadBalancerDnsName],
    ['deployment_id', outputs.deploymentId],
    ['stack_name', outputs.stackName],
    ['vpc_id', outputs.vpcId],
    ['data_subnet_ids', outputs.dataSubnetIds],
    ['future_data_security_group_id', outputs.futureDataSecurityGroupId]
  ];

  return lines
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${assertSingleLine(value)}`)
    .join('\n');
};

const parseArguments = (argumentsList) => {
  const parsed = {};
  const supported = new Set(['--file', '--stack']);

  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index];
    const value = argumentsList[index + 1];

    if (!supported.has(key) || value === undefined || value.startsWith('--')) {
      throw new Error(`Invalid CDK output arguments near ${String(key)}`);
    }
    if (Object.hasOwn(parsed, key)) {
      throw new Error(`Duplicate CDK output argument: ${key}`);
    }
    parsed[key] = value;
  }

  if (!parsed['--file'] || !parsed['--stack']) {
    throw new Error('Both --file and --stack are required');
  }

  return parsed;
};

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  try {
    const argumentsByName = parseArguments(process.argv.slice(2));
    const outputs = await readCdkOutputs(
      argumentsByName['--file'],
      argumentsByName['--stack']
    );

    console.log(formatCdkOutputs(outputs));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`CDK output validation failed: ${message}`);
    process.exitCode = 1;
  }
}
