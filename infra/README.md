# AWS CDK platform foundation

This synth-only CDK v2 application models separate `staging` and `production`
ECS/Fargate stacks for DEV-513. It does not bootstrap an account, deploy a
stack, configure GitHub credentials, or change DNS.

## Architecture

Each environment receives its own VPC, ECR repository, ECS cluster, Fargate
service, CloudWatch log group, and public Application Load Balancer. The ALB
uses `/api/health/ready`; the task definition uses `/api/health/live` and runs
the application as UID/GID `1001:1001`. Failed deployments roll back, and
bounded CPU autoscaling keeps the service between one and two staging tasks or
one and four production tasks.

The initial zero-traffic design deliberately uses public subnets with public
task IPs and no NAT gateway. Security groups allow application ingress only
from the ALB. This removes the fixed per-AZ NAT cost, but the task ENIs remain
internet-addressable at the network layer and depend on security groups for
inbound isolation. Before adding private databases or higher-value workloads,
revisit private application subnets plus NAT or VPC endpoints.

The recurring baseline is two ALBs, two small always-on Fargate tasks,
CloudWatch logs/metrics, ECR storage, public IPv4, and data transfer. ALBs are
likely to dominate while traffic is near zero. Confirm region-specific prices,
AWS credits, budgets, and billing-alert ownership before deployment.

## Local verification

No AWS credentials are needed to build, test, or synthesize:

```bash
npm ci
npm run build
npm test
npm run synth
```

The synthesized stacks output the ECR repository URI and ALB DNS name. Use the
ALB hostname for validation before any Route 53 or external DNS cutover.
