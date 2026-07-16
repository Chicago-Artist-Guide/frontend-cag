# Chicago Artist Guide

## Frontend App

This is a React and TypeScript application hosted by Next.js. The existing
React Router application is mounted as a client-rendered compatibility shell;
route-by-route server rendering is tracked separately in DEV-492.

### Local development

The native and container paths both use Node 22.22.0 and npm 10.9.4. For a
clean native checkout:

```bash
nvm install
nvm use
npm run setup
cp .env.example .env.local
npm run dev
```

Fill the six public values in the ignored `.env.local` file. The app is
available at <http://localhost:3000>. `npm run setup` installs both the app and
`infra/` lockfiles; `npm run verify` runs the complete app and CDK verification
without AWS credentials.

Docker provides the host-independent development path:

```bash
cp .env.example .env.local
npm run dev:container
```

The Compose service bind-mounts the checkout and keeps `node_modules` and
`.next` in named volumes. It runs a lockfile-driven `npm ci --prefer-offline`
at startup, so the dependency volume cannot silently drift after a lockfile
change; a separate npm-download cache keeps later starts practical. Stop it
with `docker compose down`; add `--volumes` only when intentionally resetting
those local caches.

Production commands are `npm run build` and `npm start`. The previous Vite
host remains available during migration through `npm run start:legacy`,
`npm run build:legacy`, and `npm run preview:legacy`.

### Public environment variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_LGL_API_KEY
```

Next.js embeds `NEXT_PUBLIC_*` values into the client bundle at build time, so
staging and production must build separate images with their own values. The
Firebase values are browser configuration, not server credentials. The legacy
Vite build also accepts the old `VITE_APP_*` names and maps them to this public
configuration boundary.

`NEXT_PUBLIC_LGL_API_KEY` is different: the existing SPA already exposes this
bearer value and calls Little Green Light from the browser. Keeping it here
preserves behavior, but it must not be mistaken for a protected secret. Moving
LGL behind a server endpoint and rotating the exposed credential is follow-up
security work.

Firebase remains the backend and authentication provider during this phase.
No database or authentication migration is performed by the compatibility
host.

### Email boundary

Email behavior also remains on Firebase for this phase. Firebase Auth continues
to send password-reset messages, and application email continues to write the
Firestore `mail` collection consumed by the existing Firebase email extension.
The Fargate move does not silently replace either path.

The AWS-native option to evaluate later is Amazon SES behind a server-only
`EmailService`, invoked by a Next.js route, Lambda, or a separate SQS worker.
That change needs SES production access, a verified domain, DKIM/SPF/DMARC,
bounce and complaint handling, idempotency, and an outbox/retry policy. SES is
about $0.10 per 1,000 outbound messages before data and optional features, but
transport cost is not the hard part; deliverability and failure handling are.
WorkMail is for hosted mailboxes and is not a replacement for transactional
application email.

### Health and container contracts

- `GET /api/health/live` returns `{ "status": "ok" }`.
- `GET /api/health/ready` returns `{ "status": "ready" }`.
- Neither endpoint depends on Firebase or another external provider.

Build and exercise the production contract with:

```bash
npm run container:smoke
```

The command reads `.env.local` when present, builds and loads `linux/amd64`,
uses a random loopback port, verifies the image platform and runtime UID/GID,
smokes health, nested routes, and a real Next static asset, then removes its
container and image. On Apple Silicon, the production check uses Docker's amd64
emulation because ECS is explicitly x86_64. The development Compose target
remains native to the host architecture.

The image runs as UID/GID `1001:1001`. Pull requests targeting `staging` or
`master` run app verification, credential-free CDK verification, standalone
smoke, and a full `linux/amd64` image run. Pull requests never request AWS
credentials and never deploy.

### CDK targets

The CDK app models one independently named target at a time:

- `CagPlatform-preview-<id>` for an ephemeral lowercase preview ID;
- `CagPlatform-staging` for the `staging` branch; and
- `CagPlatform-production` for the `master` branch.

With no explicit target, synthesis covers staging and production. Useful
credential-free commands from the repository root are:

```bash
npm --prefix infra run verify
npm --prefix infra run list
npm --prefix infra run list -- -c stage=preview -c previewId=dev-511
npm --prefix infra run synth -- -c stage=staging
```

Each target has a two-AZ VPC, public app subnets, isolated future-data subnets,
one Fargate task, and an HTTP ALB. There is no NAT gateway, RDS resource,
database secret, proxy, or DNS record. A future-data security group accepts
PostgreSQL port 5432 only from the app service; this is the cost-free RDS seam,
not a database deployment.

The ALB URL is an HTTP validation endpoint. Before production DNS moves, add an
ACM certificate and HTTPS listener, redirect HTTP to HTTPS, confirm the custom
domain and Firebase authorized-domain settings, and test rollback. This PR does
not touch Amplify or DNS.

### Manual GitHub-to-AWS delivery

Three SHA-pinned, GitHub-hosted workflows provide manual durable deploy,
preview deploy, and exact-confirmation preview destroy operations. They use
GitHub OIDC; no static AWS keys or developer AWS profiles belong in this
repository.

Every manual workflow first installs and verifies dependencies in a job that
cannot request an OIDC token. Jobs that can request OIDC install only the CDK
package with npm lifecycle scripts disabled; the role ARN is passed directly
to the pinned AWS credential action instead of being exposed job-wide. Plan
and deploy environments may intentionally use different roles, but a SHA-256
fingerprint requires the deploy account, region, and all six public image-build
values to exactly match the approved plan before deploy authentication.

The workflows cannot be dispatched until their definitions exist on the
default branch. This draft PR is intentionally staying open and unmerged, so
the definitions can be reviewed and tested but the AWS button is dormant.

An administrator must complete these external steps before the first deploy:

1. Confirm the AWS account, region, credits, quotas, and billing-alert owner.
2. Bootstrap that account/region for CDK v2 using an authorized admin session.
3. Create GitHub OIDC plan/deploy roles. Trust
   `token.actions.githubusercontent.com`, require audience
   `sts.amazonaws.com`, and restrict subjects to this repository and the exact
   GitHub Environment. Give the roles only the CDK bootstrap/deployment access
   required for these stacks; use a permissions boundary where available.
4. Create `staging-plan`, `staging`, `production-plan`, `production`,
   `preview-plan`, `preview`, and `preview-destroy` GitHub Environments. Add
   required reviewers and branch/tag deployment rules. Production environments
   must allow only `master`; staging environments must allow only `staging`.
   Preview reviewers must verify the selected ref and CDK diff before approval,
   because that approval authorizes the checked-out revision to use the preview
   role.
5. Set `AWS_ACCOUNT_ID`, `AWS_REGION`, and `AWS_ROLE_ARN` in every applicable
   Environment. Plan/deploy environments also need the six `NEXT_PUBLIC_*`
   values above. Paired plan/deploy environments must use the same account,
   region, and public build configuration; their role ARN may differ.
6. Confirm the repository Actions policy permits the three pinned external
   actions and that branch protection requires the pull-request checks.

As of July 16, 2026, the repository has zero GitHub Environments and no
repository-level Actions variables or secrets. The current maintainer token has
write access but cannot inspect the repository Actions policy or branch
protection, so an administrator owns those checks. No AWS or billing credential
was placed on this machine to probe the account. Billing access and ownership
remain unconfirmed and are a go/no-go gate before the first deployment.

### Representative AWS cost

Nothing in local synthesis incurs AWS cost. Once deployed, a representative
30-day `us-east-1` baseline for one 0.25-vCPU/0.5-GB task is approximately:

- Fargate compute: $8.89;
- ALB fixed hours: $16.20; and
- three public IPv4 addresses (two ALB addresses plus one task): $10.80.

That is roughly $36 per quiet environment before ALB LCUs, CloudWatch,
container image storage, data transfer, taxes, or temporary rolling/autoscaled
tasks. Budget $36-$45 per environment, about $72-$90 for staging plus
production, and roughly $1.20-$1.50 per preview day. Prices vary by region and
change over time; verify them with the
[Fargate](https://aws.amazon.com/fargate/pricing/),
[Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/pricing/),
and [VPC public IPv4](https://aws.amazon.com/vpc/pricing/) pricing pages before
approval. Deleting a preview stops its ALB/task/IP charges; retained CDK
bootstrap assets and production logs can still have small storage charges.
Paid ECS Container Insights is explicitly disabled for this baseline; enable it
only with an updated monitoring requirement and budget.

### Pull Requests (PRs)

We have standard guidelines for contributing code to the project.

1. Fork the repo to your own GitHub. You should now have a repo in your account called `<your-username>/frontend-cag`.
2. Clone that repo locally to your machine: `git clone git@github.com:<your-username>/frontend-cag.git` and then `cd frontend-cag`
3. Add the org's repo as `upstream`: `git remote add upstream git@github.com:Chicago-Artist-Guide/frontend-cag.git`
4. Create a branch off of `master` named after your JIRA ticket. For example, let's say you have JIRA ticket #125, you'd do: `git pull upstream master` on master, and then `git checkout -b dev125`
5. Contribute changes as commits to your local branch `dev125`. For new files, `git add .`, and then to add commit messages: `git commit -am "<your commit message here>"`. Your commit messages don't matter too much here because we're going to Squash and Merge later, anyway.
6. When you're ready to PR your changes, push: `git push origin dev125`
6. Go to the Chicago-Artist-Guide/frontend-cag repo in GitHub and a message should pop up recognizing your new branch. Click on `Compare & Pull Request`
7. Pull Requests must have:
	- A title formatted like so: `[DEV-XXX] Some Descriptive Title`
	- A description of the changes
	- Screenshots of the changes, if applicable
8. Your PR must be reviewed by one or both of the tech leads, depending on magnitude and/or who is available
9. Once you have your approval(s), all comments have been addressed, and tests are passing, you may click on, `Squash and Merge`. Please make sure the commit title is the same as the PR title

PR tips:
1. The smaller, the better. Smaller PRs help tech leads and team members do a better job of reviewing your code and is more respectful of everyone's time
2. Do not commit a package-lock.json file unless you've explicitly made changes to package.json
3. Do not commit and PR _any_ potentially sensitive or insecure information, keys, etc. Please confirm with the tech leads if you have a question about something being sensitive prior to it being in a commit
4. Please follow linting rules. Make sure indentation is 2 spaces, general code style is consistent/cohesive, attributes and properties are ordered alphabetically, and so forth
5. Please remind tech leads and team members in Slack if you need reviews and haven't received any

**Warning:** commits to master trigger a push and build on production in AWS. Do not merge if you have any concerns about the branch breaking something. In some cases, we may work off of specific feature branches as an extra layer of protection, so please pay attention in those situations to use the feature branches instead of master.
