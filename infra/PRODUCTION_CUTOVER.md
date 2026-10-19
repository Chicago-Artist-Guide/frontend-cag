# Next.js production cutover

The bootstrap upload and initial HTTP deployments are complete as of 2026-10-19;
do not repeat the upload. See [current status and call punchlist](PRE_SWITCH_STATUS.md)
for observed evidence and remaining activation steps. The numbered list records
the original provisioning sequence.

Local = dev; `canary` = Next.js staging; `main` = Next.js production. Legacy `master`/`staging` retain Amplify until DNS moves.

1. Upload `infra/bootstrap/bootstrap-iam.yaml` in us-east-1 as `CagGithubBootstrap`, keep defaults, acknowledge named IAM, submit.
2. `production-bootstrap` must allow only the `main` branch and use `CagGithubBootstrapRole`; never widen canary/preview roles.
3. This role can rewrite delivery inline policies and production boundaries: it is effectively admin. Main requires **0 reviews** and admins bypass protection, matching the retained legacy policy; the written 1–2 tech lead review convention applies. Main also mirrors master's `cag-engineering` push restriction and retains five required CI checks (verified 2026-10-19).
4. CI's **Bootstrap Next.js delivery** moves `CagGithubCanaryDelivery` from us-east-2 to us-east-1, retaining all four resources before deleting the old stack. It rejects drift and verifies live Retain policies before deletion.
5. CI imports without Outputs, then changes resource metadata to restore Outputs; it provisions `CagGithubProductionDelivery`, `CDKToolkit-cagprod` and the www ACM certificate, all in us-east-1. Dispatch on main after the upload.
6. `production` and `production-plan` must both override these repository variables with live **production** values (never inherit dev):
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=chicago-artist-guide`, `NEXT_PUBLIC_FIREBASE_SENDER_ID`, `NEXT_PUBLIC_LGL_API_KEY`.
7. Both environments use identical config, `NEXT_PUBLIC_SITE_URL=https://www.chicagoartistguide.org`, AWS account `095377239347`, region `us-east-1`, and their dedicated Production Plan/Deploy role.
8. Initial pre-switch production deploys over its HTTP ALB URL with `CERTIFICATE_ARN` unset. Use the managed subdomain procedure below to enable HTTPS without moving public www.
9. Dispatch canary deployment on `canary` and production deployment on `main`. Canary must still pass end to end.
10. Verify the HTTP ALB health/assets and hydrated home/login navigation, plus the served bundle's `chicago-artist-guide` Firebase project. Before any later traffic switch, require valid TLS/SNI and authenticated acceptance with an existing production test account.
11. Production's five composite indexes and www Auth authorization were observed in Firebase on 2026-10-19. Keep rules/indexes unchanged during infrastructure cutover; verify authenticated flows before traffic moves.
12. STOP after pre-DNS acceptance. Leave the www traffic CNAME on Amplify CloudFront and the public `/home` unchanged. A later traffic switch requires Chris’s separate explicit authorization; certificate-validation DNS is independent.

Import constraints: [AWS import Outputs](https://repost.aws/knowledge-center/cloudformation-change-set-errors), [metadata forces Retain/Outputs updates](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html#troubleshooting-errors-no-updates-to-perform).

## Managed production and staging HTTPS

`prod.chicagoartistguide.org` belongs to main/production. `staging.chicagoartistguide.org` belongs to canary/Next.js staging. The legacy branch named `staging` still auto-builds in Amplify, but its staging hostname is moving to Next.js. Public www remains on Amplify; the existing parent-apex redirect remains unchanged.

The retained, termination-protected `CagPlatform-production-dns` stack owns only these two child zones. Production deployment creates it as a dependency; canary imports its exact staging-zone ID. Canary destruction cannot delete either zone. App stacks own their ALB aliases and native ACM certificates. The shared bootstrap entry-role upload stays unchanged; bootstrap CI updates the execution policies first.

1. Merge the infrastructure changes with `MANAGED_DNS` and `MANAGED_HTTPS` unset. Require bootstrap CI to succeed before enabling DNS.
2. Set `MANAGED_DNS=true` and `MANAGED_HTTPS=false` identically on production/production-plan. Dispatch production deployment on main. It creates both zones and the prod ALB alias; HTTP acceptance still uses the existing ALB URL. Read both NameServers outputs from the DNS stack.
3. Promote the same infrastructure to canary through a green PR. Set the same flags identically on canary/canary-plan and dispatch canary. This seeds the staging ALB alias before delegation.
4. At the existing Google parent DNS provider, add each child zone's NS records using the exact nameservers from CloudFormation. For staging, replace the existing staging CNAME (`ext-sq.squarespace.com`, verified against the authoritative parent on 2026-10-19) with the child NS delegation: CNAME and NS cannot coexist at that name. Leave www and parent-apex records untouched. Verify public authoritative delegation and each child ALB alias before proceeding.
5. Set `MANAGED_HTTPS=true` identically on each stage's plan/deploy environment and dispatch that stage. Native CloudFormation DNS validation creates ACM's validation CNAME inside the child zone. Enabling this before delegation would hold certificate creation pending. `CERTIFICATE_ARN` must remain unset with managed DNS.
6. Require all deployment jobs, normal trusted HTTPS verification and the hydrated production browser flow to pass. CI reads the actual `ApplicationUrl` output (`https://prod...` or `https://staging...`); `NEXT_PUBLIC_SITE_URL` remains the canonical www origin, independently of the validation hostname. Verify Firebase Auth authorizes each new hostname before authenticated acceptance.

The execution policies restrict alias writes to the stage's exact A name and validation CNAME writes to `_*.stage-domain`. Route53 zone creation cannot be scoped by name in IAM, so only production has it. Neither execution policy can delete hosted zones or change www/apex/NS records. Ownership-tag conditions restrict ACM lifecycle writes to the stage's app certificates.
