# Next.js production cutover

Local development runs Next.js. The canary branch is the deployed Next.js staging
stack. Main deploys CagPlatform-production; master/staging retain their Amplify
configuration during the parallel rollout. No extra staging stack is deployed.

## One-time AWS permission prerequisite

Production bootstrap reuses the working `canary` GitHub environment and its
`CagGithubCanaryDeployRole`. Its existing OIDC trust already matches that
environment, so no trust edit or new entry-role stack is needed. The bootstrap
job is restricted to the protected main branch.

The one-time administrator action is to add a separate inline policy named
`CagProductionProvisioning` to that working role, granting production IAM/CDK
provisioning and ACM certificate requests. Keep its existing canary permissions.
The account-specific IAM policy is provided locally to the operator; no developer
AWS credentials are required.

Role permissions: https://console.aws.amazon.com/iam/home#/roles/details/CagGithubCanaryDeployRole?section=permissions

After that permission addition, Bootstrap Next.js production delivery provisions
the production roles and assets entirely in CI. `production-plan` uses
`CagGithubProductionPlanRole`; `production` uses `CagGithubProductionDeployRole`.
Both production GitHub environments are restricted to main. The initially created
production-bootstrap GitHub environment is unused by this workflow.

AWS_ACCOUNT_ID, AWS_REGION and public Firebase/LGL configuration come from the
existing repository variables. NEXT_PUBLIC_SITE_URL is
https://www.chicagoartistguide.org in both production-plan and production.
CERTIFICATE_ARN must match in those two environments.

The bootstrap workflow creates CagGithubProductionDelivery in us-east-2 and
CDKToolkit-cagprod in us-east-1. The dedicated cagprod qualifier preserves the
existing CDKToolkit/cagcanary resources. Production deployment runs automatically
on main pushes and can be dispatched again after provisioning.

## Before traffic moves

ACM must issue a certificate for the public hostname. Add only the ACM validation
CNAME to the existing DNS provider, retaining it for renewal. This is independent
of the www traffic CNAME. Do not change www until the production workflow passes
TLS verification against the new ALB.

CI validates live/ready health, HTML routes, a referenced Next static asset and
public images against the new ALB. The pre-DNS HTTPS smoke keeps the public URL,
Host and TLS SNI while curl --connect-to sends the connection to the new ALB;
normal certificate verification stays enabled and redirects fail the check.
A separate credential-free CI job exercises home → login → home browser
navigation while mapping the public hostname to the new ALB IP. It asserts the
remote address, normal TLS validation, hydrated page markers, one shell and no
uncaught browser errors. Authenticated account actions require a test account.

DNS is outside these workflows. After acceptance, replace the www CNAME currently
pointing at CloudFront with the production ALB DNS name. Leave the apex redirect
and existing legacy stacks in place during observation.
