import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { PlatformStack } from '../lib/platform-stack.js';

const createTemplate = (stageName: 'production' | 'staging') => {
  const app = new App();
  const stack = new PlatformStack(app, `CagPlatform${stageName}`, {
    stageName
  });

  return Template.fromStack(stack);
};

describe('PlatformStack', () => {
  it.each(['staging', 'production'] as const)(
    'creates an isolated %s ECS platform without NAT gateways',
    (stageName) => {
      const template = createTemplate(stageName);

      template.resourceCountIs('AWS::EC2::NatGateway', 0);
      template.resourceCountIs('AWS::ECR::Repository', 1);
      template.resourceCountIs('AWS::ECS::Cluster', 1);
      template.resourceCountIs('AWS::ECS::Service', 1);
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
      template.hasResourceProperties('AWS::ECR::Repository', {
        RepositoryName: `cag-frontend-${stageName}`
      });
    }
  );

  it('runs the application as non-root with the container health contract', () => {
    const template = createTemplate('staging');

    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          HealthCheck: {
            Command: Match.arrayWith([
              Match.stringLikeRegexp('/api/health/live')
            ])
          },
          PortMappings: Match.arrayWith([
            Match.objectLike({ ContainerPort: 3000 })
          ]),
          User: '1001:1001'
        })
      ]),
      Cpu: '256',
      Memory: '512',
      NetworkMode: 'awsvpc',
      RequiresCompatibilities: ['FARGATE']
    });
  });

  it('uses readiness for ALB routing and rollback for failed deployments', () => {
    const template = createTemplate('production');

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

  it('publishes the pre-DNS validation outputs', () => {
    const template = createTemplate('staging');

    template.hasOutput('LoadBalancerDnsName', {});
    template.hasOutput('RepositoryUri', {});
  });

  it('protects production load balancing and retains image repositories', () => {
    const template = createTemplate('production');

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
    template.hasResource('AWS::ECR::Repository', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain'
    });
  });
});
