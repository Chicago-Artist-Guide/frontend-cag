# DevOps process cutover: staging/master to canary/main

This moves everyday Next.js development and release work to canary/main using
the existing DEV ticket, tech lead review, CI, and squash conventions. It does
not move public www traffic. Repository default-branch activation and public DNS
cutover are separate operations.

## Old and new mapping

| Purpose               | Legacy flow retained during overlap                 | Next.js flow                                                                |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| Feature branch base   | `master`                                            | `main`                                                                      |
| Feature/fix PR target | `staging`                                           | `canary`                                                                    |
| Staging deployment    | Amplify from `staging`                              | ECS/Fargate `CagPlatform-canary` from `canary`                              |
| Production promotion  | Reviewed legacy staging/master flow                 | Reviewed `canary` → `main` PR                                               |
| Production deployment | Amplify from `master`; serves public www            | ECS/Fargate `CagPlatform-production` from `main`; pre-switch                |
| Backend configuration | Existing legacy configuration                       | Development Firebase on canary; `chicago-artist-guide` on production        |
| Validation hostname   | Current staging DNS is Squarespace until delegation | Approved `staging.chicagoartistguide.org` and `prod.chicagoartistguide.org` |

Normal application work starts from main and integrates through canary. An
urgent **legacy-only** fix may still start from master and PR to staging while
legacy www is live; use its existing release procedure and carry any applicable
fix into the Next.js flow separately. Never send application feature PRs directly
to main. Main-only IAM/bootstrap infrastructure PRs are the explicit exception
when production-scoped authority or shared prerequisites require that sequence;
synchronize those changes to canary through a reviewed PR.

## Developer steps

For a new fork checkout, set `GITHUB_USER` to your fork owner. Existing
checkouts can begin at `git fetch upstream`. This example uses DEV-125:

```bash
GITHUB_USER=your-github-username
git clone "git@github.com:${GITHUB_USER}/frontend-cag.git"
cd frontend-cag
git remote add upstream git@github.com:Chicago-Artist-Guide/frontend-cag.git
git fetch upstream
git switch -c dev-125 upstream/main
nvm use
npm run setup
```

Configure ignored `.env.local` using the [local setup guide](../README.md#local-development).
Make the change on `dev-125`, run `npm run verify`, commit, and push it to the
fork with `git push -u origin dev-125`. Open the PR in the organization repository
with **canary as base** and the fork's DEV branch as head. Set the base explicitly
even while GitHub still defaults to master. For example:

```bash
gh pr create --repo Chicago-Artist-Guide/frontend-cag \
  --base canary --head "${GITHUB_USER}:dev-125" \
  --title '[DEV-125] Descriptive title'
```

Keep the existing contribution requirements: describe the change, include UI
screenshots where applicable, obtain 1-2 tech lead approvals according to scope,
address review comments, and pass lint and all five PR checks. Use **Squash and
Merge** with the squash commit title matching the PR title. Do not push directly
to any shared delivery branch.

## CI, staging acceptance, and promotion

Next.js PRs into main or canary run these five credential-free checks. Legacy
master/staging heads do not contain that workflow; their Amplify builds remain
separate:

1. Verify application
2. Verify CDK infrastructure
3. Verify visual-regression harness
4. Verify E2E specs
5. Verify production container

After merging into canary, require **Deploy Next.js canary** to complete. Exercise
the changed flow against its validated application URL from the workflow summary;
record the tested canary commit, deployment run, UAT steps/results, and any
screenshots on the release/promotion PR. Check that the staging build uses
development Firebase. A green source check or deployed task alone is not UAT.

Open a promotion PR with base **main**, head **canary**, and a DEV ticket title.
Because main requires an up-to-date PR head, use the promotion PR's **Update
branch** action to merge current main into canary when GitHub reports it behind.
This is needed again after squash promotions or main-only fixes. Review the
update/conflicts, require the resulting canary deployment to pass, and repeat
UAT on that updated head. Do not reset or force-push canary to satisfy this gate.

Review the complete net diff (`git diff origin/main..origin/canary` after fetching),
obtain the same tech lead reviews, and require the five checks. Confirm its head
is the canary snapshot that passed deployment/UAT;
if canary changes, test the new snapshot before merging. Squash and merge only
when that evidence is current. Main then builds separately with production
Firebase and runs **Deploy Next.js production**; verify its deployment and
pre-switch acceptance at the reported application URL.

If source checks, deployment, or UAT fail, fix forward on a DEV branch through
canary and repeat acceptance before promotion. Re-run a failed workflow when the
cause is corrected. Resolve conflicts through reviewed commits; do not reset or
force-push shared branches. Main-only infrastructure fixes use the exception
above and must be synchronized back to canary. Neither a successful promotion nor
a default-branch change authorizes a public www DNS switch.

## Current controls and delivery snapshot — 2026-10-19

- GitHub's default branch is still **master**. Only squash merging is enabled;
  merge commits and rebase merging are disabled.
- Main now mirrors master's `cag-engineering` push restriction and branch-creation
  restriction. Main retains its five required CI checks with strict/up-to-date
  enforcement. The configured approval count remains zero and administrators can
  bypass protection, as in the retained legacy policy; the written 1-2 tech lead
  review convention above still applies.
- Staging and canary are unprotected. Canary runs the five PR checks, but GitHub
  does not enforce them as branch-required checks. Follow the review/green-check
  process manually; this document introduces no new review-policy decision.
- All six AWS Environments are branch-restricted:

  | Allowed branch | Environments                                            |
  | -------------- | ------------------------------------------------------- |
  | `main` only    | `production-plan`, `production`, `production-bootstrap` |
  | `canary` only  | `canary-plan`, `canary`, `canary-destroy`               |

- Master and staging retain Amplify auto-builds; branch autodetection is off.
  Public www still uses Amplify/master; apex records remain unchanged. The authoritative parent currently
  points the staging hostname at `ext-sq.squarespace.com` (CNAME, TTL 14400),
  despite the Amplify branch configuration. Its deliberate move to Next.js requires
  replacing that CNAME with child-zone NS delegation. Cached old answers may
  persist for four hours.
- Native managed DNS/HTTPS code is merged. Production plan/deploy currently use
  `MANAGED_DNS=true`, `MANAGED_HTTPS=false`; canary plan/deploy use the same flags.
  The shared DNS stack is CREATE_COMPLETE with termination protection activated,
  observed in AWS. Keep TLS disabled until parent delegation is verified.
- Infrastructure synchronization [PR #348](https://github.com/Chicago-Artist-Guide/frontend-cag/pull/348)
  is merged to canary (`d355fbf9`). The [main-only bootstrap run](https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39318229318)
  and [production DNS deployment](https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39318229380)
  succeeded, including HTTP health/assets and hydrated home → login → home browser
  navigation. The [canary source/deployment flow](https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39319239404)
  is the acceptance gate for the synchronized canary head. Authenticated product
  acceptance remains separate and requires existing production test accounts.
- Historical draft [PR #335](https://github.com/Chicago-Artist-Guide/frontend-cag/pull/335)
  is closed as superseded. Its entire head
  (`26b42906442694c8ce54d9e17a8da2b47cfc5244`) is already an ancestor of main and
  canary; no code port, legacy merge, branch deletion, or owner action is needed.

Use [the call punchlist](PRE_SWITCH_STATUS.md) for exact DNS records and remaining
acceptance actions. Use [Production cutover](PRODUCTION_CUTOVER.md) for zone outputs, delegation,
certificate validation, and hostname activation. Those steps do not change the
public www traffic record or public `/home`.

## Tonight's call: process-activation checklist

- [ ] Confirm the team will use main → DEV branch → canary → UAT → main, with the
      existing ticket/review/CI/squash conventions and the narrow legacy/infra exceptions.
- [ ] Review PR #348's canary deployment and record UAT evidence for the current
      canary head; review the production deployment's separate pre-switch acceptance.
- [ ] Assign the coordinator and effective time for changing the GitHub default
      branch from **master to main**. This is a pending process-activation action,
      not an action this document claims to have performed.
- [ ] At activation, change the default branch, verify new PRs and fork/upstream
      instructions use main as the feature base, and explicitly choose canary as the
      integration PR target. Leave the legacy branches and Amplify builds in place.
- [ ] Confirm Dependabot's GitHub Actions update configuration targets **canary**
      once the configuration is on the new default branch.
- [x] Resolve historical PR #335 as superseded; it is closed and its code is
      already present. For any other legacy PR discovered later, inspect its net diff with its owner.
      Start a fresh DEV branch from main, carry over only the needed commits or
      changes, then PR to canary with a link to the original. Repeat review/CI/UAT
      before closing the original as superseded; do not bulk-retarget old PRs.
- [ ] Record the effective process and release owners. Keep the separate DNS/TLS
      checklist visible; retain the www/apex traffic hold.
