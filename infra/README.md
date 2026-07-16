# AWS CDK platform foundation

This CDK v2 application defines the AWS-native ECS/Fargate foundation for the
Chicago Artist Guide compatibility host. It does not create a database,
credential, DNS record, or static AWS access key.

## Deployment targets

Every explicit CDK invocation selects one of three target classes:

- `preview` requires a unique lowercase `previewId` and creates
  `CagPlatform-preview-<id>`.
- `staging` creates `CagPlatform-staging`.
- `production` creates `CagPlatform-production`.

With no stage context, CDK creates the two persistent stacks so CI can verify
both configurations in one credential-free synth. A targeted invocation
creates exactly one stack:

```bash
npm run list
npm run list -- -c stage=preview -c previewId=dev-511
npm run synth -- -c stage=staging
```

Preview IDs must be 3-20 characters, start and end with a letter or number,
and contain only lowercase letters, numbers, and single hyphens. Protected
target names are rejected.

## Architecture

Each target contains:

- a two-AZ VPC with public application subnets and isolated data subnets;
- no NAT gateway;
- one ECS cluster and x86_64 Fargate service running as UID/GID `1001:1001`;
- an internet-facing Application Load Balancer;
- a CDK-managed, immutable `linux/amd64` Docker image asset;
- CloudWatch logs and bounded CPU autoscaling; and
- a cost-free future-data security group that accepts TCP 5432 only from the
  application service.

The data subnets have no internet route. There is intentionally no RDS
instance or cluster, RDS Proxy, Secrets Manager secret, VPC endpoint, Route 53
record, or other database resource yet. The isolated subnet IDs, VPC ID, and
future-data security group ID are outputs so a later relational-data change can
attach to the existing boundary.

The ALB checks `/api/health/ready`; ECS checks `/api/health/live`. Failed ECS
deployments roll back. Preview and staging logs are stack-owned so either target
can be torn down and recreated without a retained-name collision. Production
logs are retained, and production also enables CloudFormation termination
protection and ALB deletion protection. Paid ECS Container Insights is
explicitly disabled for the zero-traffic baseline; application logs and native
ECS/ALB metrics remain available.

## Application image configuration

Next.js embeds these browser-visible values when the image is built:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_LGL_API_KEY`

CDK passes all six values as Docker build arguments and builds the `runner`
target for `linux/amd64`. The Firebase values are public browser configuration.
The existing LGL value is also exposed by the current browser application and
must not be treated as a protected server secret; moving that integration
behind a server endpoint is separate follow-up work.

The asset is published to the account's CDK bootstrap repository before
CloudFormation updates the task definition. There is no application-owned ECR
repository and no mutable `latest` deployment race.

## Local verification

Use Node 22. No AWS credentials are needed to compile, test, list, or synthesize:

```bash
npm ci
npm run verify
```

An AWS deployment is intentionally outside local verification. It should run
from the approved GitHub-hosted workflow through OIDC only after account,
region, role, CDK bootstrap, billing controls, and environment approvals have
been configured outside this repository.

The stack outputs the load balancer hostname and `http://` URL for validation
before any production DNS cutover.
