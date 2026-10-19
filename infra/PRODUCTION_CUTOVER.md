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
8. Initial pre-switch production deploys over its HTTP ALB URL with `CERTIFICATE_ARN` unset. HTTPS activation is a later PR: publish the validation CNAME, confirm ISSUED, then configure both production environments identically.
9. Dispatch canary deployment on `canary` and production deployment on `main`. Canary must still pass end to end.
10. Verify the HTTP ALB health/assets and hydrated home/login navigation, plus the served bundle's `chicago-artist-guide` Firebase project. Before any later traffic switch, require valid TLS/SNI and authenticated acceptance with an existing production test account.
11. Production's five composite indexes and www Auth authorization were observed in Firebase on 2026-10-19. Keep rules/indexes unchanged during infrastructure cutover; verify authenticated flows before traffic moves.
12. STOP after pre-DNS acceptance. Leave the www traffic CNAME on Amplify CloudFront and the public `/home` unchanged. A later traffic switch requires Chris’s separate explicit authorization; certificate-validation DNS is independent.

Import constraints: [AWS import Outputs](https://repost.aws/knowledge-center/cloudformation-change-set-errors), [metadata forces Retain/Outputs updates](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html#troubleshooting-errors-no-updates-to-perform).
