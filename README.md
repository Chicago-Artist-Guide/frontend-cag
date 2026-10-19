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

The image runs as UID/GID `1001:1001`. Pull requests targeting `canary` or
`main` run five credential-free checks: application,
CDK infrastructure, visual-regression harness, E2E specs, and the production
container. Legacy master/staging heads do not contain that GitHub workflow;
their Amplify builds remain separate. Next.js PR checks never request AWS
credentials or deploy.

### Next.js delivery

Normal development follows **main → DEV branch → PR to canary → staging UAT →
canary-to-main promotion PR**. GitHub’s default remains master until the
coordinated process activation. Keep the existing DEV ticket titles, descriptions,
UI screenshots, 1-2 tech lead reviews, passing checks, and Squash and Merge.
See the [DevOps cutover runbook](infra/DEVOPS_CUTOVER.md) for developer commands,
release steps, current GitHub controls, and the process-activation checklist.
The [pre-switch status and call punchlist](infra/PRE_SWITCH_STATUS.md) contains
the exact DNS delegation records and remaining acceptance actions.

- `canary` deploys `CagPlatform-canary` on ECS/Fargate using development Firebase.
- `main` deploys `CagPlatform-production` using production Firebase
  (`chicago-artist-guide`). Production remains separate from the public www site.
- The six AWS GitHub Environments allow only their corresponding `canary` or
  `main` branch and use OIDC; local AWS credentials are unnecessary.
- Legacy `master`/`staging` still auto-build in Amplify. Public www remains there;
  the existing apex redirect stays unchanged. Legacy fixes use the exception in the runbook.

Approved Next.js hostnames are `prod.chicagoartistguide.org` and
`staging.chicagoartistguide.org`. Managed DNS/HTTPS code is merged; HTTPS stays
disabled until the Google parent DNS delegates the child zones. Use the actual
validated application/ALB URL from the deployment summary during that sequence.
Changing the development process or repository default branch does not authorize
a www DNS switch. Follow [Production cutover](infra/PRODUCTION_CUTOVER.md) for
infrastructure and hostname activation.

Credential-free infrastructure checks from the repository root:

```bash
npm --prefix infra run verify
npm --prefix infra run list -- -c stage=canary
npm --prefix infra run synth -- -c stage=canary
```

The [infrastructure guide](infra/README.md) describes the stack boundaries and
additional synthesis targets. CI builds and deploys the images through OIDC;
plan/deploy configuration fingerprints must match before deployment.

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

1. Fork the repo to your own GitHub and clone `<your-username>/frontend-cag`.
2. Add the organization's repository as `upstream`: `git remote add upstream git@github.com:Chicago-Artist-Guide/frontend-cag.git`.
3. Fetch upstream and create your DEV branch from `main`: `git fetch upstream`, then `git switch -c dev-125 upstream/main` for DEV-125.
4. Commit your changes on the DEV branch, run the local checks, and push with `git push -u origin dev-125`.
5. Open the PR against **canary**. Use `[DEV-XXX] Descriptive Title`, describe the changes, and include screenshots for UI changes.
6. Obtain 1-2 tech lead approvals according to the change's scope and the existing review convention. Address comments and require all five CI checks to pass.
7. Use **Squash and Merge**, with the squash commit title matching the PR title. Then verify the canary deployment and exercise the changed flow in staging.
8. Promote the tested canary snapshot through a **canary → main** PR with the same reviews, CI, and squash convention. Do not target application feature PRs directly at main.

Use the [cutover runbook](infra/DEVOPS_CUTOVER.md) for release evidence, existing
PR handling, the main-only IAM/bootstrap exception, and temporary legacy fixes.

PR tips:

1. The smaller, the better. Smaller PRs help tech leads and team members do a better job of reviewing your code and is more respectful of everyone's time
2. Do not commit a package-lock.json file unless you've explicitly made changes to package.json
3. Do not commit and PR _any_ potentially sensitive or insecure information, keys, etc. Please confirm with the tech leads if you have a question about something being sensitive prior to it being in a commit
4. Please follow linting rules. Make sure indentation is 2 spaces, general code style is consistent/cohesive, attributes and properties are ordered alphabetically, and so forth
5. Please remind tech leads and team members in Slack if you need reviews and haven't received any

**Deployment branches:** merging into canary or main starts the corresponding
Next.js deployment. Legacy master/staging still auto-build Amplify, and master
continues to serve public www. Use the PR process for all four branches; verify
the deployed flow and fix failures forward. A main deployment does not move www.
