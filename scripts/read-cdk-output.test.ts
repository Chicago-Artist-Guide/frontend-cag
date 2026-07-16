import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  formatCdkOutputs,
  readCdkOutputs
} from './read-cdk-output.mjs';

const stackName = 'CagPlatform-preview-dev-511';
const loadBalancerDnsName =
  'cagplatform-loadbalancer-a1b2c3d4e5.us-east-1.elb.amazonaws.com';

describe('readCdkOutputs', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'cag-cdk-output-'));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  const writeOutputs = async (value: unknown) => {
    const filePath = join(directory, 'outputs.json');
    await writeFile(filePath, JSON.stringify(value), 'utf8');
    return filePath;
  };

  it('reads only the exact stack and returns useful validated fields', async () => {
    const filePath = await writeOutputs({
      OtherStack: {
        LoadBalancerDnsName: 'other-123.us-east-1.elb.amazonaws.com'
      },
      [stackName]: {
        DataSubnetIds: 'subnet-aaa,subnet-bbb',
        DeploymentId: 'preview-dev-511',
        FutureDataSecurityGroupId: 'sg-0123456789abcdef0',
        LoadBalancerDnsName: loadBalancerDnsName,
        VpcId: 'vpc-0123456789abcdef0'
      }
    });

    await expect(readCdkOutputs(filePath, stackName)).resolves.toEqual({
      baseUrl: `http://${loadBalancerDnsName}`,
      dataSubnetIds: 'subnet-aaa,subnet-bbb',
      deploymentId: 'preview-dev-511',
      futureDataSecurityGroupId: 'sg-0123456789abcdef0',
      loadBalancerDnsName,
      stackName,
      vpcId: 'vpc-0123456789abcdef0'
    });
  });

  it('normalizes a CloudFormation-generated mixed-case ALB hostname', async () => {
    const mixedCaseHostname =
      'CagPlatform-LoadBalancer-A1B2C3D4.us-east-1.elb.amazonaws.com';
    const filePath = await writeOutputs({
      [stackName]: { LoadBalancerDnsName: mixedCaseHostname }
    });

    await expect(readCdkOutputs(filePath, stackName)).resolves.toMatchObject({
      baseUrl: `http://${mixedCaseHostname.toLowerCase()}`,
      loadBalancerDnsName: mixedCaseHostname.toLowerCase()
    });
  });

  it.each([
    'https://cag-123.us-east-1.elb.amazonaws.com',
    'cag-123.us-east-1.elb.amazonaws.com/path',
    'cag.example.com',
    'cag-123.us-east-1.elb.amazonaws.com\nbase_url=https://evil.test',
    '-cag-123.us-east-1.elb.amazonaws.com'
  ])('rejects the malformed ALB hostname %j', async (hostname) => {
    const filePath = await writeOutputs({
      [stackName]: { LoadBalancerDnsName: hostname }
    });

    await expect(readCdkOutputs(filePath, stackName)).rejects.toThrow(
      'valid AWS load balancer hostname'
    );
  });

  it.each([
    'SomeOtherStack',
    'CagPlatform-preview-staging',
    'CagPlatform-preview-DEV-511',
    'CagPlatform-preview-dev-511;echo'
  ])('rejects arbitrary stack name %j', async (invalidStackName) => {
    const filePath = await writeOutputs({
      [invalidStackName]: { LoadBalancerDnsName: loadBalancerDnsName }
    });

    await expect(
      readCdkOutputs(filePath, invalidStackName)
    ).rejects.toThrow('valid CAG platform stack name');
  });

  it('rejects an output file without the exact requested stack', async () => {
    const filePath = await writeOutputs({
      'CagPlatform-staging': { LoadBalancerDnsName: loadBalancerDnsName }
    });

    await expect(readCdkOutputs(filePath, stackName)).rejects.toThrow(
      `does not contain exact stack ${stackName}`
    );
  });

  it('formats safe GitHub outputs and rejects line injection', () => {
    expect(
      formatCdkOutputs({
        baseUrl: `http://${loadBalancerDnsName}`,
        deploymentId: 'preview-dev-511',
        loadBalancerDnsName,
        stackName
      })
    ).toBe(
      [
        `base_url=http://${loadBalancerDnsName}`,
        `load_balancer_dns_name=${loadBalancerDnsName}`,
        'deployment_id=preview-dev-511',
        `stack_name=${stackName}`
      ].join('\n')
    );

    expect(() =>
      formatCdkOutputs({
        baseUrl: 'http://safe.test\ninjected=true',
        loadBalancerDnsName: 'safe.test',
        stackName
      })
    ).toThrow('CDK output values must be single-line');
  });
});
