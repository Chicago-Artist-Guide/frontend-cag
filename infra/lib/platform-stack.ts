import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
  Tags
} from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

export interface PlatformStackProps extends StackProps {
  stageName: 'production' | 'staging';
}

export class PlatformStack extends Stack {
  constructor(scope: Construct, id: string, props: PlatformStackProps) {
    super(scope, id, props);

    const { stageName } = props;
    const isProduction = stageName === 'production';

    Tags.of(this).add('Application', 'chicago-artist-guide');
    Tags.of(this).add('Environment', stageName);
    Tags.of(this).add('ManagedBy', 'aws-cdk');

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicApplication',
          subnetType: ec2.SubnetType.PUBLIC
        }
      ]
    });

    const repository = new ecr.Repository(this, 'Repository', {
      imageScanOnPush: true,
      lifecycleRules: [{ maxImageCount: isProduction ? 25 : 10 }],
      repositoryName: `cag-frontend-${stageName}`
    });
    repository.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const cluster = new ecs.Cluster(this, 'Cluster', {
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
      vpc
    });

    const logGroup = new logs.LogGroup(this, 'ApplicationLogs', {
      logGroupName: `/cag/${stageName}/frontend`,
      removalPolicy: isProduction
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      retention: isProduction
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'TaskDefinition',
      {
        cpu: 256,
        memoryLimitMiB: 512,
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
        }
      }
    );

    const container = taskDefinition.addContainer('Application', {
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        STAGE_NAME: stageName
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          'node -e "fetch(\'http://127.0.0.1:3000/api/health/live\').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"'
        ],
        interval: Duration.seconds(30),
        retries: 3,
        startPeriod: Duration.seconds(10),
        timeout: Duration.seconds(5)
      },
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'application'
      }),
      user: '1001:1001'
    });
    container.addPortMappings({
      containerPort: 3000,
      name: 'http',
      protocol: ecs.Protocol.TCP
    });

    const service = new ecs.FargateService(this, 'Service', {
      assignPublicIp: true,
      circuitBreaker: { rollback: true },
      cluster,
      desiredCount: 1,
      enableExecuteCommand: false,
      healthCheckGracePeriod: Duration.seconds(60),
      minHealthyPercent: 100,
      taskDefinition,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC }
    });

    const loadBalancer = new elbv2.ApplicationLoadBalancer(
      this,
      'LoadBalancer',
      {
        deletionProtection: isProduction,
        internetFacing: true,
        vpc
      }
    );
    const listener = loadBalancer.addListener('HttpListener', {
      open: true,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP
    });
    listener.addTargets('ApplicationTargets', {
      deregistrationDelay: Duration.seconds(30),
      healthCheck: {
        healthyHttpCodes: '200',
        interval: Duration.seconds(30),
        path: '/api/health/ready',
        timeout: Duration.seconds(5)
      },
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service]
    });
    service.connections.allowFrom(
      loadBalancer,
      ec2.Port.tcp(3000),
      'Allow ALB traffic to the application'
    );

    const scaling = service.autoScaleTaskCount({
      maxCapacity: isProduction ? 4 : 2,
      minCapacity: 1
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      scaleInCooldown: Duration.seconds(120),
      scaleOutCooldown: Duration.seconds(60),
      targetUtilizationPercent: 60
    });

    new CfnOutput(this, 'LoadBalancerDnsName', {
      description: 'Use this hostname for validation before a DNS cutover.',
      value: loadBalancer.loadBalancerDnsName
    });
    new CfnOutput(this, 'RepositoryUri', {
      description: 'Push the application image to this repository.',
      value: repository.repositoryUri
    });
  }
}
