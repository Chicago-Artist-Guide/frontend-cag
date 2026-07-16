# CDK/Fargate Delivery Design

## Goal

Make the Next.js compatibility host reproducible from a clean checkout and
deployable to an isolated AWS ECS/Fargate stack through GitHub Actions. A
maintainer must be able to approve a GitHub Environment deployment, receive an
Application Load Balancer URL, run the repository smoke test against it, and
remove an ephemeral preview without changing Amplify, Route 53, or production
DNS.

## Decisions already made

- AWS CDK v2 and CloudFormation are the infrastructure path; SST and Terraform
  are out of scope.
- GitHub-hosted Actions assume AWS roles through OIDC. No static AWS access
  keys, AWS profiles, host names, or developer-machine paths are stored in the
  repository.
- Next.js runs as a standalone Node.js container on ECS/Fargate behind an ALB.
- Firebase remains the application backend and authentication provider during
  this phase.
- No RDS instance, database proxy, database secret, NAT gateway, or DNS record
  is provisioned now.
- Existing Amplify staging and production remain untouched until the Fargate
  deployment has been proven independently.

## Local development contract

Node 22.22.0 and npm 10.9.4 are the supported native toolchain. `.nvmrc`, the
package engine, and the package-manager declaration describe that contract.
`npm run setup` installs both application and infrastructure lockfiles, while
`npm run verify` runs application lint, tests, the standalone build, CDK tests,
and credential-free synthesis. Live standalone and production-container smoke
checks remain explicit commands and run in pull-request CI.

Docker Compose provides the host-independent path. The development service
uses the same Node base image as production, mounts the checkout for hot
reload, keeps dependencies in a named volume, and publishes port 3000. Startup
runs `npm ci --prefer-offline` against the lockfile, with a separate npm cache,
so dependency changes cannot leave a stale named volume. Public Firebase
configuration is copied from `.env.example` to an ignored `.env.local`. The
file contains names and empty/example-safe values only.

The production image accepts the six `NEXT_PUBLIC_*` values as Docker build
arguments because Next.js embeds them at build time. The Firebase values are
public browser configuration. The existing LGL key is also already exposed by
the browser application and must not be mistaken for a protected secret; moving
that integration behind a server-side API is follow-up work. The final image
contains only the standalone server and runs as UID/GID 1001.

## CDK architecture

An explicit CDK stage creates one deployment target:

- `preview` requires a caller-supplied lowercase deployment name and produces
  a stack such as `CagPlatform-preview-dev-511`.
- `staging` produces `CagPlatform-staging`.
- `production` produces `CagPlatform-production`.

The deployment identifier is included in explicit names, logs, outputs, and
tags. Preview identifiers are strictly validated before synthesis, preventing
accidental reuse of staging or production resources. With no explicit stage,
credential-free synthesis covers both durable stacks.

The stack contains:

- A two-AZ VPC with public application subnets and isolated data subnets.
- No NAT gateway.
- A CDK `DockerImageAsset` built for `linux/amd64`. CDK publishes the immutable
  asset to the bootstrapped ECR repository before CloudFormation starts the
  task, eliminating the empty-repository/`latest` race.
- An ECS cluster, one 256 CPU/512 MiB Fargate task, CloudWatch logs, deployment
  circuit breaker, and bounded CPU scaling. Paid ECS Container Insights is
  explicitly disabled for the zero-traffic baseline.
- An internet-facing HTTP ALB using `/api/health/ready`; ECS uses
  `/api/health/live`.
- A cost-free future-data security group in the isolated subnet boundary. It
  accepts PostgreSQL port 5432 only from the application service. No database
  resource or credential exists.
- Outputs for the ALB URL, deployment identifier, VPC, isolated subnet IDs,
  and future-data security group.

Preview and staging logs are stack-owned so teardown/recreation cannot collide;
production logs are retained. Preview/production deletion protection differs
explicitly. CDK bootstrap image assets are shared account infrastructure and
are not owned by an individual preview stack.

## Deferred data migration path

This hosting change deliberately keeps Firebase intact, but it establishes the
order for replacing it without another big-bang rewrite:

1. Run the existing UI in the Next.js compatibility host.
2. Put stable domain-service interfaces in front of current Firebase functions.
3. Move each domain's query execution behind authenticated server endpoints,
   while the service still reads and writes Firebase.
4. Add a relational store, schema, indexes, migrations, reconciliation, and
   observability only after those contracts exist.
5. Backfill and dual-read/dual-write one bounded domain, compare results, move
   reads, then writes, and retain a rollback window before removing its
   Firestore path.
6. Retire Firestore domain by domain; keep Firebase Auth until it has its own
   separately approved migration.

The current code provides concrete first candidates. `Matches/api.ts` fans out
one Firestore query per filter, intersects document IDs in the browser, refetches
surviving profiles, and may perform a match-status read per profile.
`useCompanies.ts` and `useUsers.ts` read entire collections, join and sort them
in memory, then paginate after the fact. `useAnalyticsData.ts` performs full
collection scans and browser-side aggregation. Production/role matching also
loads active productions and filters nested roles locally. These belong behind
versioned service methods and, once relational, indexed SQL views/functions or
stored procedures with server-enforced authorization and database pagination.

No RDS resource is justified until the service boundary, data ownership,
backfill/reconciliation plan, recovery objectives, and cost owner are approved.
The isolated subnets and source-restricted future-data security group are the
only database seam in this stack.

## GitHub Actions delivery

Pull requests stay credential-free. CI installs both lockfiles, runs the
application and infrastructure suites separately, synthesizes all persistent
stacks, builds the standalone server, performs a live server smoke test, and
builds the production Docker image.

Manual workflows begin with a credential-free validation job that installs
both lockfiles and runs the applicable verification. OIDC-enabled jobs install
only infrastructure dependencies with npm lifecycle scripts disabled. The AWS
role ARN is not job-wide; it is passed directly to the pinned credential action.
Deployment jobs use GitHub-hosted runners with only `contents: read` and
job-scoped `id-token: write`. Plan/deploy GitHub Environments supply:

- `AWS_ACCOUNT_ID`
- `AWS_REGION`
- `AWS_ROLE_ARN`
- The six public `NEXT_PUBLIC_*` build values

Preview, staging, and production use separately protected GitHub Environments
and may use separate AWS roles. The AWS trust policy restricts the OIDC subject
to this repository and the corresponding GitHub Environment, and validates the
`sts.amazonaws.com` audience. These trust policies, role ARNs, account IDs,
environment approvals, CDK bootstrap stack, and billing controls live outside
the repository.

Before deploy authentication, the workflow hashes the account, region, and all
six public image-build values and requires an exact match with the plan job's
fingerprint. Plan and deploy role ARNs are deliberately excluded so least-
privilege read/deploy roles can differ. A protected Environment approval is the
trust boundary for executing the reviewed CDK application with OIDC. Preview
reviewers must verify the selected ref and diff before granting that authority.

The deployment workflow validates the target, verifies without OIDC,
fingerprints required environment values, runs `cdk diff`, deploys exactly one
stack, extracts the ALB hostname from CDK outputs, runs `npm run smoke:server`,
and writes the URL to the job summary. Production and staging deploy only from
their matching branches. Preview deployment and destruction are separate
manually dispatched workflows and accept only validated preview identifiers.

Deployment workflows are deliberately not triggered by pull requests or by
merging this draft. GitHub exposes a new `workflow_dispatch` workflow only
after the workflow exists on the default branch. This PR will remain open and
unmerged, so it can deliver tested workflow definitions but cannot safely
exercise their OIDC path yet. No feature-branch deployment trigger is
introduced as a workaround.

## Failure and cleanup behavior

- Missing public configuration fails before Docker/CDK work begins.
- Invalid or protected deployment identifiers fail before AWS authentication.
- ECS deployment circuit breaker rolls back an unhealthy task definition.
- A failed smoke test leaves the stack available for inspection; it does not
  silently change DNS or production.
- Preview teardown targets only the exact `CagPlatform-preview-*` stack name.
- Concurrency serializes deployments per target so two jobs cannot update the
  same stack simultaneously.
- ALB and Fargate charges begin at deployment and end only after successful
  teardown; the preview workflow summary always includes a cleanup reminder.

## Verification

Automated tests cover target validation, stack naming, preview lifecycle,
immutable image references, zero NAT/RDS resources, isolated data subnets,
security-group direction, health checks, deletion protection, outputs, and
workflow-facing configuration. Local verification covers Node/npm versions,
clean lockfile installation, application lint/tests/build, live standalone
smoke, infrastructure build/tests/synthesis, workflow YAML parsing, and a
Docker build when a daemon is available.

At representative `us-east-1` public pricing, one quiet target is about $36 per
30 days: $8.89 for Fargate, $16.20 for fixed ALB hours, and $10.80 for three
public IPv4 addresses. Budget $36-$45 per environment before LCUs, logs, ECR,
data transfer, rolling tasks, taxes, and regional variation. Billing ownership
and access are external go/no-go checks.

Firebase Auth password-reset email and the Firestore `mail` extension remain
unchanged. A future server-only `EmailService` may target SES, but only after
domain verification, DKIM/SPF/DMARC, production access, bounce/complaint
handling, idempotency, and retry/outbox design.

An actual AWS deployment is intentionally not part of this implementation
pass. It begins only after approval, GitHub Environment configuration, OIDC
role creation, CDK bootstrap, and a separately authorized merge or trusted
default-branch installation of the workflows. This implementation will be
pushed to the existing draft PR but will not merge it.
