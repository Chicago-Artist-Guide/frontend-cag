# Next.js production cutover

Local development runs Next.js. The canary branch is the deployed Next.js staging
stack. Main deploys CagPlatform-production; master/staging retain their Amplify
configuration during the parallel rollout. No extra staging stack is deployed.

## One-time AWS permission prerequisite

CI discovery on 2026-10-19 found only canary-scoped usable deployment roles. The
older CagGithubOidcDeployRole has no attached or inline policies. CI cannot create
its own production IAM authority with those credentials.

An AWS administrator must create the CloudFormation stack
CagGithubProductionBootstrapEntry from `bootstrap/production-entry-iam.yaml`
with CAPABILITY_NAMED_IAM in account 095377239347. This can be done by uploading
the template in the AWS console; no AWS CLI credentials belong on developer
machines. The role trusts only this repository's production-bootstrap OIDC
environment. It provisions production delivery roles/assets and requests the
production ACM certificate; it has no DNS permissions.

Then the Bootstrap Next.js production delivery workflow runs from main in CI.
The production-bootstrap environment uses AWS_ROLE_ARN ending in
`role/CagGithubProductionBootstrapRole`; production-plan uses
`role/CagGithubProductionPlanRole`; production uses
`role/CagGithubProductionDeployRole`. Restrict all three environments to main.
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
