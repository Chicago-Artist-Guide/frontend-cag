import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
  Tags
} from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import type { Construct } from 'constructs';
import type { DeploymentTarget } from './deployment-target.js';

export const PUBLIC_BUILD_ARGUMENT_NAMES = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_LGL_API_KEY'
] as const;

export type PublicBuildArguments = Record<
  (typeof PUBLIC_BUILD_ARGUMENT_NAMES)[number],
  string
>;

export interface PlatformStackProps extends StackProps {
  buildArguments: PublicBuildArguments;
  target: DeploymentTarget;
  certificateArn?: string;
  webAclArn?: string;
  flowLogs?: boolean;
  cpu?: number;
  memoryLimitMiB?: number;
}

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..'
);

export class PlatformStack extends Stack {
  constructor(scope: Construct, id: string, props: PlatformStackProps) {
    const {
      buildArguments,
      target,
      certificateArn,
      webAclArn,
      flowLogs = false,
      cpu = 256,
      memoryLimitMiB = 512,
      ...stackProps
    } = props;
    super(scope, id, {
      ...stackProps,
      terminationProtection: target.isProduction
    });

    Tags.of(this).add('Application', 'chicago-artist-guide');
    Tags.of(this).add('DeploymentId', target.deploymentId);
    Tags.of(this).add('Environment', target.stageName);
    Tags.of(this).add('ManagedBy', 'aws-cdk');

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicApplication',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'Data',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
      ]
    });
    if (flowLogs) {
      const flowLogGroup = new logs.LogGroup(this, 'VpcFlowLogGroup', {
        logGroupName: `/cag/${target.deploymentId}/vpc-flow-logs`,
        removalPolicy: target.isProduction
          ? RemovalPolicy.RETAIN
          : RemovalPolicy.DESTROY,
        retention: target.isProduction
          ? logs.RetentionDays.ONE_MONTH
          : logs.RetentionDays.ONE_WEEK
      });
      new ec2.FlowLog(this, 'VpcFlowLogs', {
        resourceType: ec2.FlowLogResourceType.fromVpc(vpc),
        destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup)
      });
    }


    const applicationImage = new ecrAssets.DockerImageAsset(
      this,
      'ApplicationImage',
      {
        buildArgs: buildArguments,
        directory: repositoryRoot,
        exclude: ['infra/cdk.out'],
        platform: ecrAssets.Platform.LINUX_AMD64,
        target: 'runner'
      }
    );

    const cluster = new ecs.Cluster(this, 'Cluster', {
      containerInsightsV2: ecs.ContainerInsights.DISABLED,
      vpc
    });

    const logGroup = new logs.LogGroup(this, 'ApplicationLogs', {
      logGroupName: `/cag/${target.deploymentId}/frontend`,
      removalPolicy: target.isProduction
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      retention: target.isProduction
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'TaskDefinition',
      {
        cpu,
        memoryLimitMiB,
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
        STAGE_NAME: target.stageName
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
      image: ecs.ContainerImage.fromDockerImageAsset(applicationImage),
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

    const futureDataSecurityGroup = new ec2.SecurityGroup(
      this,
      'FutureDataSecurityGroup',
      {
        allowAllOutbound: false,
        description:
          'Reserved PostgreSQL boundary for a future relational data service',
        vpc
      }
    );
    futureDataSecurityGroup.addIngressRule(
      service.connections.securityGroups[0],
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from the application service'
    );

    const loadBalancer = new elbv2.ApplicationLoadBalancer(
      this,
      'LoadBalancer',
      {
        deletionProtection: target.isProduction,
        internetFacing: true,
        vpc
      }
    );
    const listener = loadBalancer.addListener('HttpListener', {
      open: true,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP
    });
    if (certificateArn) {
      listener.addAction('RedirectToHttps', {
        action: elbv2.ListenerAction.redirect({
          permanent: true,
          port: '443',
          protocol: 'HTTPS'
        })
      });
      const certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        certificateArn
      );
      const httpsListener = loadBalancer.addListener('HttpsListener', {
        certificates: [certificate],
        port: 443,
        protocol: elbv2.ApplicationProtocol.HTTPS
      });
      httpsListener.addTargets('ApplicationTargets', {
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
    } else {
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
    }
    service.connections.allowFrom(
      loadBalancer,
      ec2.Port.tcp(3000),
      'Allow ALB traffic to the application'
    );
    if (webAclArn) {
      new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
        resourceArn: loadBalancer.loadBalancerArn,
        webAclArn
      });
    }


    const scaling = service.autoScaleTaskCount({
      maxCapacity: target.isProduction ? 4 : 2,
      minCapacity: 1
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      scaleInCooldown: Duration.seconds(120),
      scaleOutCooldown: Duration.seconds(60),
      targetUtilizationPercent: 60
    });

    const dataSubnetIds = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED
    }).subnetIds;

    new CfnOutput(this, 'VpcId', {
      value: vpc.vpcId
    });
    new CfnOutput(this, 'DataSubnetIds', {
      value: dataSubnetIds.join(',')
    });
    new CfnOutput(this, 'FutureDataSecurityGroupId', {
      value: futureDataSecurityGroup.securityGroupId
    });
    new CfnOutput(this, 'DeploymentId', {
      value: target.deploymentId
    });
    new CfnOutput(this, 'LoadBalancerDnsName', {
      description: 'Use this hostname for validation before a DNS cutover.',
      value: loadBalancer.loadBalancerDnsName
    });
    new CfnOutput(this, 'LoadBalancerUrl', {
      value: `${certificateArn ? 'https' : 'http'}://${loadBalancer.loadBalancerDnsName}`
    });
  }
}
