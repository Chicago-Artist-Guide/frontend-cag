# Next.js production cutover

Local = dev; `canary` = Next.js staging; `main` = Next.js production. Legacy `master`/`staging` retain Amplify until DNS moves.

1. Upload `infra/bootstrap/bootstrap-iam.yaml` in us-east-1 as `CagGithubBootstrap`, keep defaults, acknowledge named IAM, submit.
2. `production-bootstrap` must allow only the `main` branch and use `CagGithubBootstrapRole`; never widen canary/preview roles.
3. This role can rewrite delivery inline policies and production boundaries: it is effectively admin. Main currently requires **0 reviews**, and admins bypass protection (verified 2026-10-19); protection changes are the owner's decision.
4. CI's **Bootstrap Next.js delivery** moves `CagGithubCanaryDelivery` from us-east-2 to us-east-1, retaining all four resources before deleting the old stack. It rejects drift and verifies live Retain policies before deletion.
5. CI imports without Outputs, then changes resource metadata to restore Outputs; it provisions `CagGithubProductionDelivery`, `CDKToolkit-cagprod` and the www ACM certificate, all in us-east-1. Dispatch on main after the upload.
6. `production` and `production-plan` must both override these repository variables with live **production** values (never inherit dev):
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=chicago-artist-guide`, `NEXT_PUBLIC_FIREBASE_SENDER_ID`, `NEXT_PUBLIC_LGL_API_KEY`.
7. Both environments use identical config, `NEXT_PUBLIC_SITE_URL=https://www.chicagoartistguide.org`, AWS account `095377239347`, region `us-east-1`, and their dedicated Production Plan/Deploy role.
8. Add the certificate validation CNAME printed by bootstrap at Google Cloud DNS; keep it for renewal. Re-run bootstrap to confirm ISSUED, then set identical `CERTIFICATE_ARN` variables in both production environments.
9. Dispatch canary deployment on `canary` and production deployment on `main`. Canary must still pass end to end.
10. Before DNS, require CI ALB HTTPS and hydrated-browser smokes with valid TLS/SNI; verify `/`, `/shows`, `/login` and the served bundle's `chicago-artist-guide` Firebase project. Authenticated acceptance requires an existing production test account.
11. Production's five composite indexes and www Auth authorization were observed in Firebase on 2026-10-19. Keep rules/indexes unchanged during infrastructure cutover; verify authenticated flows before traffic moves.
12. After acceptance, replace the www CNAME pointing at Amplify CloudFront with the production ALB DNS target. Verify resolution, valid HTTPS and Next.js after the flip; retain the apex redirect and legacy stacks.

Import constraints: [AWS import Outputs](https://repost.aws/knowledge-center/cloudformation-change-set-errors), [metadata forces Retain/Outputs updates](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html#troubleshooting-errors-no-updates-to-perform).
