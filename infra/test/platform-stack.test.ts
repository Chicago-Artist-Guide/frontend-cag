import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import type {
  AssetManifest,
  DockerImageSource
} from 'aws-cdk-lib/cloud-assembly-schema';
import type { CloudAssembly } from 'aws-cdk-lib/cx-api';
import { resolveDeploymentTarget } from '../lib/deployment-target.js';
import {
  PlatformStack,
  type PublicBuildArguments
} from '../lib/platform-stack.js';

const buildArguments: PublicBuildArguments = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'api-key',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'app-id',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'measurement-id',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'project-id',
  NEXT_PUBLIC_FIREBASE_SENDER_ID: 'sender-id',
  NEXT_PUBLIC_LGL_API_KEY: 'lgl-key'
};

const createStack = (
  stageName: 'preview' | 'production' | 'staging',
  previewId?: string
) => {
  const app = new App();
  const target = resolveDeploymentTarget(stageName, previewId);
  const stack = new PlatformStack(app, target.stackName, {
    buildArguments,
    target
  });

  return { app, stack, template: Template.fromStack(stack) };
};

const getDockerImageSource = (assembly: CloudAssembly): DockerImageSource => {
  const assetArtifact = Object.values(assembly.manifest.artifacts ?? {}).find(
    (artifact) => artifact.type === 'cdk:asset-manifest'
  );
  const assetProperties = assetArtifact?.properties as
    | { file?: string }
    | undefined;
  expect(assetProperties).toHaveProperty('file');

  const manifest = JSON.parse(
    readFileSync(
      join(assembly.directory, String(assetProperties?.file)),
      'utf8'
    )
  ) as AssetManifest;
  const dockerImages = Object.values(manifest.dockerImages ?? {});
  expect(dockerImages).toHaveLength(1);

  return dockerImages[0].source;
};

const resourceTypes = (template: Template) =>
  Object.values(template.toJSON().Resources).map(
    (resource) => (resource as { Type: string }).Type
  );

describe('PlatformStack', () => {
  it.each([
    ['preview', 'dev-511'],
    ['staging', undefined],
    ['production', undefined]
  ] as const)(
    'creates the %s ECS platform without stateful AWS services',
    (stage, previewId) => {
      const { template } = createStack(stage, previewId);
      const types = resourceTypes(template);

      template.resourceCountIs('AWS::EC2::NatGateway', 0);
      template.resourceCountIs('AWS::ECR::Repository', 0);
      template.resourceCountIs('AWS::ECS::Cluster', 1);
      template.resourceCountIs('AWS::ECS::Service', 1);
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
      expect(
        types.filter((type) => type.startsWith('AWS::RDS::'))
      ).toHaveLength(0);
      expect(
        types.filter((type) => type.startsWith('AWS::SecretsManager::'))
      ).toHaveLength(0);
      expect(
        types.filter((type) => type.startsWith('AWS::Route53::'))
      ).toHaveLength(0);
    }
  );

  it('builds one immutable linux/amd64 runner image with all public arguments', () => {
    const { app, template } = createStack('staging');

    const source = getDockerImageSource(app.synth());

    expect(source).toEqual(
      expect.objectContaining({
        dockerBuildArgs: buildArguments,
        dockerBuildTarget: 'runner',
        platform: 'linux/amd64'
      })
    );
    expect(
      JSON.stringify(template.findResources('AWS::ECS::TaskDefinition'))
    ).not.toContain('latest');
  });

  it('keeps nested install and synthesis artifacts out of the Docker asset', () => {
    const { app } = createStack('staging');
    const assembly = app.synth();
    const source = getDockerImageSource(assembly);
    expect(source.directory).toBeDefined();
    const assetDirectory = join(assembly.directory, String(source.directory));

    expect(existsSync(join(assetDirectory, 'node_modules'))).toBe(false);
    expect(existsSync(join(assetDirectory, 'infra'))).toBe(false);
  });

  it('creates public application and isolated data subnets in two AZs without isolated routes', () => {
    const { template } = createStack('staging');

    template.resourceCountIs('AWS::EC2::Subnet', 4);
    template.resourceCountIs('AWS::EC2::Route', 2);
    template.hasResourceProperties('AWS::EC2::Subnet', {
      MapPublicIpOnLaunch: true,
      Tags: Match.arrayWith([
        Match.objectLike({
          Key: 'aws-cdk:subnet-name',
          Value: 'PublicApplication'
        })
      ])
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
      MapPublicIpOnLaunch: false,
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'aws-cdk:subnet-name', Value: 'Data' })
      ])
    });
    template.allResourcesProperties('AWS::EC2::Route', {
      DestinationCidrBlock: '0.0.0.0/0',
      GatewayId: Match.anyValue(),
      RouteTableId: Match.anyValue()
    });
  });

  it('allows PostgreSQL to the future-data boundary only from the ECS service', () => {
    const { template } = createStack('staging');
    const securityGroups = template.findResources('AWS::EC2::SecurityGroup');
    const futureDataEntry = Object.entries(securityGroups).find(([logicalId]) =>
      logicalId.startsWith('FutureDataSecurityGroup')
    );
    const ingressResources = Object.values(
      template.findResources('AWS::EC2::SecurityGroupIngress')
    ).filter(
      (resource) =>
        resource.Properties.GroupId?.['Fn::GetAtt']?.[0] ===
        futureDataEntry?.[0]
    );

    expect(futureDataEntry).toBeDefined();
    expect(
      futureDataEntry?.[1].Properties.SecurityGroupIngress
    ).toBeUndefined();
    expect(ingressResources).toEqual([
      expect.objectContaining({
        Properties: {
          Description: 'Allow PostgreSQL from the application service',
          FromPort: 5432,
          GroupId: {
            'Fn::GetAtt': [futureDataEntry?.[0], 'GroupId']
          },
          IpProtocol: 'tcp',
          SourceSecurityGroupId: {
            'Fn::GetAtt': [
              expect.stringMatching(/^ServiceSecurityGroup/),
              'GroupId'
            ]
          },
          ToPort: 5432
        }
      })
    ]);
  });

  it('runs the application as x86_64 non-root with the live health contract', () => {
    const { template } = createStack('staging');

    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          HealthCheck: {
            Command: Match.arrayWith([
              Match.stringLikeRegexp('/api/health/live')
            ])
          },
          Image: Match.not('latest'),
          PortMappings: Match.arrayWith([
            Match.objectLike({ ContainerPort: 3000 })
          ]),
          User: '1001:1001'
        })
      ]),
      Cpu: '256',
      Memory: '512',
      NetworkMode: 'awsvpc',
      RequiresCompatibilities: ['FARGATE'],
      RuntimePlatform: {
        CpuArchitecture: 'X86_64',
        OperatingSystemFamily: 'LINUX'
      }
    });
  });

  it('disables paid Container Insights for the zero-traffic baseline', () => {
    const { template } = createStack('staging');
    const clusters = template.findResources('AWS::ECS::Cluster');
    const [cluster] = Object.values(clusters) as Array<{
      Properties?: { ClusterSettings?: unknown };
    }>;

    expect(Object.values(clusters)).toHaveLength(1);
    expect(cluster.Properties?.ClusterSettings).toEqual([
      { Name: 'containerInsights', Value: 'disabled' }
    ]);
  });

  it('uses readiness for ALB routing and rollback for failed deployments', () => {
    const { template } = createStack('production');

    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      HealthCheckPath: '/api/health/ready',
      Port: 3000,
      Protocol: 'HTTP'
    });
    template.hasResourceProperties('AWS::ECS::Service', {
      DeploymentConfiguration: Match.objectLike({
        DeploymentCircuitBreaker: {
          Enable: true,
          Rollback: true
        }
      })
    });
  });

  it.each([
    ['preview', 'dev-511', 'preview-dev-511'],
    ['staging', undefined, 'staging'],
    ['production', undefined, 'production']
  ] as const)(
    'publishes the required %s outputs',
    (stage, previewId, deploymentId) => {
      const { template } = createStack(stage, previewId);

      template.hasOutput('VpcId', {});
      template.hasOutput('DataSubnetIds', {});
      template.hasOutput('FutureDataSecurityGroupId', {});
      template.hasOutput('DeploymentId', { Value: deploymentId });
      template.hasOutput('LoadBalancerDnsName', {});
      template.hasOutput('LoadBalancerUrl', {});
      template.hasResourceProperties('AWS::ECS::Cluster', {
        Tags: Match.arrayWith([
          { Key: 'DeploymentId', Value: deploymentId },
          { Key: 'Environment', Value: stage }
        ])
      });
    }
  );

  it('keeps previews destroyable and unprotected', () => {
    const { stack, template } = createStack('preview', 'dev-511');

    expect(stack.terminationProtection).toBe(false);
    template.hasResource('AWS::Logs::LogGroup', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });
    template.hasResourceProperties(
      'AWS::ElasticLoadBalancingV2::LoadBalancer',
      {
        LoadBalancerAttributes: Match.arrayWith([
          {
            Key: 'deletion_protection.enabled',
            Value: 'false'
          }
        ])
      }
    );
  });

  it('keeps staging teardown and recreation self-contained', () => {
    const { template } = createStack('staging');

    template.hasResource('AWS::Logs::LogGroup', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });
  });

  it('retains production logs', () => {
    const { template } = createStack('production');

    template.hasResource('AWS::Logs::LogGroup', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain'
    });
  });

  it('protects the production stack and load balancer', () => {
    const { stack, template } = createStack('production');

    expect(stack.terminationProtection).toBe(true);
    template.hasResourceProperties(
      'AWS::ElasticLoadBalancingV2::LoadBalancer',
      {
        LoadBalancerAttributes: Match.arrayWith([
          {
            Key: 'deletion_protection.enabled',
            Value: 'true'
          }
        ])
      }
    );
  });
});
