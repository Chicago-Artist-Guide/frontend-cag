# CDK/Fargate Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Next.js application reproducible locally and deliver tested, manually approved GitHub OIDC workflows that can deploy and destroy isolated CDK/Fargate stacks without provisioning RDS or changing DNS.

**Architecture:** Docker Compose and repository scripts provide the local contract. CDK synthesizes one validated deployment target at a time and publishes a content-addressed Docker asset to the bootstrapped ECR repository. GitHub-hosted Actions keep pull requests credential-free and use protected GitHub Environments plus OIDC for manual plan, deploy, smoke, and preview teardown jobs.

**Tech Stack:** Node.js 22.22.0, npm 10.9.4, Next.js 16, Docker/Compose, AWS CDK v2, ECS/Fargate, ALB, Vitest, GitHub Actions, AWS OIDC.

---

### Task 1: Make clean-checkout verification deterministic

**Files:**
- Create: `.env.example`
- Create: `scripts/public-env.mjs`
- Create: `scripts/public-env.test.ts`
- Modify: `.npmrc`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `docs/superpowers/plans/2026-07-16-nextjs-container-ci-foundation.md`

- [x] **Step 1: Write failing public-environment contract tests**

Test an exported `PUBLIC_ENV_NAMES`, `readPublicBuildArgs(environment)`, and
`requirePublicBuildArgs(environment)`. The required function must report every
missing variable without printing configured values.

- [x] **Step 2: Verify the tests fail because the module is absent**

Run:

```bash
npx vitest run scripts/public-env.test.ts
```

Expected: import failure for `scripts/public-env.mjs`.

- [x] **Step 3: Implement the environment contract and clean test boundary**

Add the six literal `NEXT_PUBLIC_*` names, return a Docker build-argument
record, and throw `Missing required public build variables: ...` when values
are blank. Add `infra/**` to the root Vitest exclusion so application tests do
not depend on `infra/node_modules`.

- [x] **Step 4: Pin npm and add repository orchestration scripts**

Add `packageManager: npm@10.9.4`, enable `engine-strict=true`, and add:

```json
"setup": "npm ci && npm --prefix infra ci",
"infra:verify": "npm --prefix infra run verify",
"verify": "npm run lint:check && npm test && npm run build && npm run infra:verify"
```

The sanitized `.env.example` contains all six names with empty values and
comments stating that real values belong in ignored `.env.local` or GitHub
Environment variables.

- [x] **Step 5: Remove host-specific paths from the tracked foundation plan**

Replace the two absolute NVM paths with `nvm use && npm test`.

- [x] **Step 6: Verify green under Node 22**

Run:

```bash
nvm use
npx vitest run scripts/public-env.test.ts
npm test
npm --prefix infra test
```

Expected: the new tests, 177 application tests, and CDK tests pass independently.

### Task 2: Reproduce development and production containers

**Files:**
- Create: `compose.yaml`
- Create: `scripts/smoke-container.mjs`
- Create: `scripts/smoke-container.test.ts`
- Modify: `.dockerignore`
- Modify: `Dockerfile`
- Modify: `package.json`
- Modify: `scripts/smoke-server.mjs`
- Modify: `scripts/smoke-server.test.ts`

- [x] **Step 1: Extend smoke tests before implementation**

Add failing cases that require a bounded request timeout, a nested route, and
at least one emitted `/_next/static/` asset referenced by the HTML shell.

- [x] **Step 2: Add failing container-command tests**

Design `createContainerCommands(options)` to return exact build, run, inspect,
logs, and cleanup argument arrays. Assert `linux/amd64`, build arguments from
the environment contract, non-root inspection, unique container names, and
cleanup in a `finally` path.

- [x] **Step 3: Verify red**

Run:

```bash
npx vitest run scripts/smoke-server.test.ts scripts/smoke-container.test.ts
```

Expected: failures for the new smoke behavior and absent container module.

- [x] **Step 4: Implement the stronger server and container smoke clients**

`smokeServer` checks live, ready, `/home`, `/about-us`, and one static asset.
Each request has a bounded timeout and external cancellation through body
consumption. `smoke-container.mjs` uses argument-array `execFile` calls, builds
and loads `linux/amd64`, starts detached, invokes the server smoke client,
inspects image architecture/user, emits redacted logs on failure, and enforces
container/image cleanup, including SIGINT/SIGTERM paths.

- [x] **Step 5: Update the Dockerfile**

Copy `.npmrc` with both lockfiles. Add a `development` target. In the builder,
declare and export all six public build arguments, then run the tested
validator before `npm run build`. Preserve the non-root standalone runner.

- [x] **Step 6: Add Compose and npm entry points**

`compose.yaml` uses the development target for hot reload and a production
profile for the exact `linux/amd64` image. It reads only `.env.local`, publishes
configurable host ports, and uses named dependency/cache volumes. Add:

```json
"dev:container": "docker compose up --build app",
"container:smoke": "node scripts/smoke-container.mjs"
```

- [x] **Step 7: Verify tests and Docker when available**

Run:

```bash
npx vitest run scripts/public-env.test.ts scripts/smoke-server.test.ts scripts/smoke-container.test.ts
npm run build
npm run container:smoke
```

Expected: unit/build checks pass; the container command passes when Docker is running and otherwise reports the daemon blocker without changing repository state.

### Task 3: Model validated deployment targets

**Files:**
- Create: `infra/lib/deployment-target.ts`
- Create: `infra/test/deployment-target.test.ts`
- Modify: `infra/bin/app.ts`
- Modify: `infra/package.json`

- [x] **Step 1: Write target tests**

Test `staging`, `production`, and a `preview` named `dev-511`. Assert exact
deployment IDs and stack names, lowercase slug validation, a 20-character
preview limit, and rejection of `staging`, `production`, path separators,
shell punctuation, empty names, and unknown stages.

- [x] **Step 2: Verify red**

Run:

```bash
npm --prefix infra test -- deployment-target.test.ts
```

Expected: import failure for `deployment-target.ts`.

- [x] **Step 3: Implement the target resolver**

Use the API:

```typescript
resolveDeploymentTarget(stage: unknown, previewId?: unknown): {
  deploymentId: string;
  isEphemeral: boolean;
  isProduction: boolean;
  stackName: string;
  stageName: 'preview' | 'staging' | 'production';
}
```

Stack names are `CagPlatform-preview-<id>`, `CagPlatform-staging`, and
`CagPlatform-production`.

- [x] **Step 4: Instantiate only requested stacks**

With no CDK context, `app.ts` creates staging and production for
credential-free CI synthesis. With `-c stage=...`, it creates exactly one
target; preview additionally requires `-c previewId=...`.

- [x] **Step 5: Add deterministic infra commands and verify**

Add `list`, `verify`, and context-aware synth scripts. Run the tests plus:

```bash
npm --prefix infra run synth
npm --prefix infra exec cdk -- list -c stage=preview -c previewId=dev-511
```

Expected: persistent synth succeeds and the list contains only `CagPlatform-preview-dev-511`.

### Task 4: Make the Fargate stack atomic and preview-safe

**Files:**
- Modify: `infra/lib/platform-stack.ts`
- Modify: `infra/test/platform-stack.test.ts`
- Modify: `infra/README.md`

- [x] **Step 1: Write failing stack assertions**

Add tests for preview/staging/production configurations. Assert:

- no named application ECR repository or `latest` image;
- one CDK Docker image asset built for `linux/amd64`;
- one public and one isolated subnet class per AZ, zero NAT gateways;
- zero RDS, RDS Proxy, Secrets Manager, and Route 53 resources;
- a future-data security group receiving TCP 5432 only from the service;
- preview destroy policies and no deletion/termination protection;
- production ALB deletion protection and stack termination protection;
- health paths, x86_64 runtime, outputs, and deployment tags.

- [x] **Step 2: Verify red**

Run:

```bash
npm --prefix infra test -- platform-stack.test.ts
```

Expected: assertions fail against the retained ECR/`latest`, public-only VPC,
and two-stage-only properties.

- [x] **Step 3: Use an immutable Docker image asset**

Create `DockerImageAsset` from the repository root with `target: runner`,
`platform: Platform.LINUX_AMD64`, and the six public build arguments read from
the process environment. Use `ContainerImage.fromDockerImageAsset(asset)`.

- [x] **Step 4: Add the future relational-data seam without RDS**

Add isolated `Data` subnets and a `FutureDataSecurityGroup`. Allow PostgreSQL
only from the ECS service and output the VPC, isolated subnet IDs, and security
group ID. Do not add a database, secret, NAT gateway, endpoint, or proxy.

- [x] **Step 5: Apply lifecycle and safety settings**

Use deployment-specific log names/tags, destroy preview and staging logs,
retain production logs, explicitly disable paid Container Insights, enable
production stack/ALB protection, and keep previews independently destroyable.

- [x] **Step 6: Verify infrastructure**

Run:

```bash
npm --prefix infra run build
npm --prefix infra test
npm --prefix infra run synth
```

Expected: TypeScript, all assertions, and credential-free synthesis pass.

### Task 5: Add tested workflow-facing deployment utilities

**Files:**
- Create: `scripts/deployment-target.mjs`
- Create: `scripts/deployment-target.test.ts`
- Create: `scripts/deployment-config.mjs`
- Create: `scripts/deployment-config.test.ts`
- Create: `scripts/read-cdk-output.mjs`
- Create: `scripts/read-cdk-output.test.ts`

- [x] **Step 1: Write failing CLI contract tests**

Test the same target names as CDK, durable branch restrictions
(`staging`/`staging`, `production`/`master`), preview confirmation, and JSON/CDK
output extraction. Reject arbitrary stack names and malformed ALB hostnames.

- [x] **Step 2: Verify red**

Run:

```bash
npx vitest run scripts/deployment-target.test.ts scripts/read-cdk-output.test.ts
```

- [x] **Step 3: Implement dependency-free CLIs**

The target CLI accepts values only through arguments/environment, emits
GitHub-output-safe `key=value` lines, and never evaluates shell text. The
output reader accepts an outputs-file path plus exact stack name and emits an
`http://` ALB base URL after hostname validation.

- [x] **Step 4: Verify green**

Run the focused tests and representative CLI invocations for preview,
staging, production, and preview-destroy confirmation.

### Task 6: Add credential-free CI and dormant OIDC delivery workflows

**Files:**
- Create: `.github/dependabot.yml`
- Create: `.github/workflows/deploy-environment.yml`
- Create: `.github/workflows/preview-deploy.yml`
- Create: `.github/workflows/preview-destroy.yml`
- Create: `scripts/workflow-contract.test.ts`
- Modify: `.github/workflows/pull-request.yml`

- [x] **Step 1: Write failing workflow contract tests**

Read workflow files as text. Assert pull-request CI has no OIDC/AWS access,
all external actions are pinned to 40-character SHAs, deployment workflows are
manual-only, use GitHub-hosted runners and protected environments, set only
`contents: read` plus job-scoped `id-token: write`, disable cancellation for
deploy/destroy concurrency, and contain no account IDs, role ARNs, AWS keys,
host paths, or automatic production trigger.

- [x] **Step 2: Verify red**

Run:

```bash
npx vitest run scripts/workflow-contract.test.ts
```

Expected: missing deployment workflow failures and mutable action-tag failures.

- [x] **Step 3: Repair and expand pull-request CI**

Pin `checkout` to `de0fac2e4500dabe0009e67214ff5f5447ce83dd` and
`setup-node` to `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e`. Install
both lockfiles. Run app and infra verification separately. Provide deterministic
fake public build values, copy standalone static/public assets before smoke,
build `linux/amd64`, run the image, smoke it, inspect architecture/user, print
logs on failure, and always remove the test container.

- [x] **Step 4: Add manual environment and preview workflows**

Use `workflow_dispatch` only. The durable workflow accepts `staging` or
`production` and enforces the matching selected ref. Preview workflows accept
only `preview_id`; destroy also requires exact confirmation. Plan and deploy
jobs use separate GitHub Environments. Pin
`configure-aws-credentials` to
`d979d5b3a71173a29b74b5b88418bfda9437d885`, set
`allowed-account-ids`, mask the account ID, use unique session names, run the
tested target/output utilities, publish `cdk diff`, deploy exactly one stack,
and smoke the ALB. Run dependency lifecycle and full verification only in a
no-OIDC job. In OIDC jobs, install infrastructure with lifecycle scripts
disabled and do not expose the role ARN job-wide. Fingerprint account, region,
and all public build values in plan/deploy, and reject drift before deploy
authentication. No workflow changes DNS.

- [x] **Step 5: Add Actions dependency updates and verify YAML/contracts**

Configure monthly Dependabot updates for `github-actions`. Run focused tests,
Ruby YAML parsing for all workflows, and searches for credentials and mutable
action tags.

### Task 7: Document operations, verify, review, and push without merging

**Files:**
- Modify: `README.md`
- Modify: `infra/README.md`
- Modify: `docs/superpowers/specs/2026-07-16-cdk-fargate-delivery-design.md`
- Modify: `docs/superpowers/plans/2026-07-16-cdk-fargate-delivery.md`

- [x] **Step 1: Document exact local and external setup**

Cover native and Compose setup, public build-time variables, Apple Silicon,
one-command verification, Docker smoke/cleanup, CDK target commands, GitHub
Environment variable names, OIDC/bootstrap responsibilities, ALB validation,
cost cleanup, the RDS-free data seam, the exposed legacy LGL credential risk,
and the fact that manual workflows are unavailable until trusted default-branch
installation.

- [x] **Step 2: Run fresh complete verification under Node 22**

Run:

```bash
nvm use
npm ci
npm --prefix infra ci
npm run lint:check
npm test
npm run build
npm --prefix infra run verify
npm run container:smoke
ruby -e "require 'yaml'; Dir['.github/workflows/*.{yml,yaml}'].each { |f| YAML.load_file(f, aliases: true); puts f }"
git diff --check origin/master...HEAD
```

If Docker is unavailable, record that single external blocker and retain the
passing unit/build/synth evidence; do not claim the container ran.

- [x] **Step 3: Request independent spec and code-quality reviews**

Provide reviewers the design, plan, `origin/master` base SHA, and final head
SHA. Fix all critical and important findings, then rerun affected verification.

- [x] **Step 4: Commit and push only**

Commit the scoped changes on `dev-512`, push to `origin/dev-512`, confirm PR
#335 remains open and draft against `master`, and do not merge, close, or change
its base.

## Execution record — July 16, 2026

Tasks 1-6 and Task 7 steps 1-3 were implemented with test-first red/green
evidence. Independent CDK, container, and workflow reviews approved the final
remediations with no remaining scoped findings. A fresh Node 22 installation
passed the repository's complete `npm run verify` command: 256 application
tests, 46 infrastructure tests, the production Next.js build, lint with the
existing 371-warning ceiling, and credential-free synthesis. Live standalone
HTTP smoke, both Compose configurations, actionlint, and YAML parsing passed.

The production Docker smoke was invoked and stopped at its explicit external
precondition because Docker Desktop's daemon is not running on this machine;
the command emitted the actionable daemon diagnostic. No AWS deployment, DNS
change, Amplify mutation, database, GitHub Environment, credential write, or
PR merge was performed. Task 7 step 4 was completed by pushing only `dev-512`
and confirming PR #335 remained open and draft against `master`.
