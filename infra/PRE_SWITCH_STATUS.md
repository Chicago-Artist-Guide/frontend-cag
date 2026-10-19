# CAG pre-switch production: evening call, 19 October 2026

Production is deployed and reachable before the public website switches. Public www still serves legacy Amplify; the existing apex redirect remains unchanged. AWS has created both managed child DNS zones. Trusted subdomain HTTPS awaits parent DNS delegation using the exact records below.

Pre-switch production: http://CagPla-LoadB-zdZwHQHZSeUD-1278217193.us-east-1.elb.amazonaws.com/home

Process cutover: [staging/master → canary/main](DEVOPS_CUTOVER.md).
Infrastructure activation: [managed DNS/HTTPS](PRODUCTION_CUTOVER.md#managed-production-and-staging-https).

## Actions for the call

| Owner                  | Action                                                                                                                                                                                                               | Acceptance                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Parent DNS owner       | Delegate prod.chicagoartistguide.org and staging.chicagoartistguide.org to the exact child-zone nameservers below. Replace the existing staging Squarespace CNAME with staging NS records.                           | Public NS lookups reach the AWS child zones; www and parent-apex records are unchanged.                                      |
| CAG account owner      | Provide existing artist and company production test accounts for acceptance.                                                                                                                                         | Codex can exercise authenticated flows over trusted HTTPS without inventing a production account.                            |
| CAG product/test leads | Confirm the critical journeys: login/logout, password reset, artist/company profiles, casting/show/role discovery and messaging.                                                                                     | Record pass/fail and specific reproducible issues against pre-switch prod.                                                   |
| Engineering leads      | Announce the DevOps process cutover: feature branches from main, integration PRs into canary, then a reviewed canary-to-main promotion. Update local branch targets and coordinate the GitHub default-branch change. | New work follows the existing DEV title, lint, 1–2 tech-lead reviews and squash-merge guidelines using the new branch names. |

Public www cutover is a separate decision after HTTPS and authenticated acceptance. No public switch is authorized by this punchlist.

## Branches

| Branch           | Deployment                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| main             | Next.js production ECS; prod.chicagoartistguide.org after delegation/HTTPS activation            |
| canary           | Next.js staging ECS; staging.chicagoartistguide.org after its intentional staging move           |
| master           | Legacy Amplify production; public www remains here                                               |
| staging          | Legacy Amplify staging; branch auto-build remains, but the staging hostname is moving to Next.js |
| Feature branches | Next.js PR checks; no automatic deployment                                                       |

Both legacy Amplify branches have auto-build enabled. Five GitHub PR checks run for Next.js main/canary (required by main protection); canary is unprotected, matching legacy staging. Legacy branch heads have no GitHub Actions workflow. Main now mirrors master’s cag-engineering push restriction while retaining its five CI checks. The documented tech-lead review convention remains unchanged; legacy protection does not enforce an approval count. AWS environments are branch-restricted: production/main, canary/canary.

## Deployment evidence

- Managed production deployment and hydrated home → login → home browser navigation passed: https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39318229380
- Managed canary rollout: https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39319239404
- Bootstrap with both execution policies passed: https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39318229318
- Canary redeployment after the CI fix passed: https://github.com/Chicago-Artist-Guide/frontend-cag/actions/runs/39305752872
- Managed DNS/HTTPS infrastructure merged: https://github.com/Chicago-Artist-Guide/frontend-cag/pull/347
- Bootstrap argument fix merged after all required checks: https://github.com/Chicago-Artist-Guide/frontend-cag/pull/349
- Canary promotion: https://github.com/Chicago-Artist-Guide/frontend-cag/pull/348

## DNS delegation values

AWS confirmed both child zones in stack CagPlatform-production-dns are CREATE_COMPLETE and termination protection is activated. Both ALB A aliases answer directly from their authoritative child zones. HTTP `/home` returns 200 with the intended prod/staging Host header through each ALB. Require the linked canary rollout to finish successfully before delegating staging.

At the parent DNS provider, add these exact records (UI host fields: `prod` and `staging`). Keep www and the parent apex unchanged. Replace the existing staging CNAME (`ext-sq.squarespace.com`, TTL 14400) with staging NS delegation; CNAME and NS cannot coexist at that name. Cached Squarespace answers may persist for four hours after the change.

```dns
prod.chicagoartistguide.org. 300 IN NS ns-1881.awsdns-43.co.uk.
prod.chicagoartistguide.org. 300 IN NS ns-687.awsdns-21.net.
prod.chicagoartistguide.org. 300 IN NS ns-1425.awsdns-50.org.
prod.chicagoartistguide.org. 300 IN NS ns-322.awsdns-40.com.
staging.chicagoartistguide.org. 300 IN NS ns-1162.awsdns-17.org.
staging.chicagoartistguide.org. 300 IN NS ns-1694.awsdns-19.co.uk.
staging.chicagoartistguide.org. 300 IN NS ns-531.awsdns-02.net.
staging.chicagoartistguide.org. 300 IN NS ns-48.awsdns-06.com.
```

AWS zone references: production `Z09325433RTTI9KK3ZBR8`, canary `Z09267323HJZTERJAA8Z1`. TLS remains disabled until authoritative delegation is verified; CloudFormation will then create and renew native ACM certificates and validate directly against each deployed ALB.
