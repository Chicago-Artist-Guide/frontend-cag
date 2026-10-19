# AWS CDK platform foundation

Development/release process: [DevOps cutover](DEVOPS_CUTOVER.md).
Infrastructure and DNS sequencing: [Production cutover](PRODUCTION_CUTOVER.md).

`canary` is the active Next.js staging branch and deploys `CagPlatform-canary`;
`main` deploys `CagPlatform-production`. The legacy `staging`/`master` branches
retain their Amplify deployments while public www remains on Amplify.

This CDK v2 application defines the AWS-native ECS/Fargate application stacks
and optional managed subdomain DNS/HTTPS. It creates no database, credential,
or static AWS access key.

## Deployment targets

| CDK stage    | App stack                  | Delivery use                                                  |
| ------------ | -------------------------- | ------------------------------------------------------------- |
| `canary`     | `CagPlatform-canary`       | Active staging CI from the canary branch                      |
| `production` | `CagPlatform-production`   | Active production CI from main                                |
| `preview`    | `CagPlatform-preview-<id>` | Explicit isolated synthesis target                            |
| `staging`    | `CagPlatform-staging`      | Earlier generic CDK target; not the active staging deployment |

With no stage context, credential-free synthesis still covers the generic
`staging` and `production` configurations. Explicit context selects one app
stack; managed production DNS also adds the persistent DNS-stack dependency.
From `infra/`:

```bash
npm run list -- -c stage=canary
npm run synth -- -c stage=canary
npm run list -- -c stage=preview -c previewId=dev-511
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
instance or cluster, RDS Proxy, Secrets Manager secret, VPC endpoint, or other
database resource yet. The isolated subnet IDs, VPC ID, and future-data security
group ID are outputs so a later relational-data change can
attach to the existing boundary.

The ALB checks `/api/health/ready`; ECS checks `/api/health/live`. Failed ECS
deployments use ECS deployment circuit breaker recovery. Preview and canary
logs are stack-owned so either target can be torn down and recreated without a
retained-name collision. Production
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

AWS deployment runs through the branch-scoped GitHub OIDC workflows, after
credential-free verification and plan/configuration checks. The six environments
and their allowed branches are documented in [DevOps cutover](DEVOPS_CUTOVER.md).

The validated `ApplicationUrl` output is HTTP until TLS is enabled. Optional
managed DNS uses `prod.chicagoartistguide.org` and `staging.chicagoartistguide.org`;
its retained `CagPlatform-production-dns` stack owns the two child zones while
app stacks own ALB aliases and native ACM certificates. Keep `MANAGED_HTTPS=false`
until parent delegation is verified. Follow [Production cutover](PRODUCTION_CUTOVER.md)
for activation; public www stays on Amplify and apex records stay unchanged.
