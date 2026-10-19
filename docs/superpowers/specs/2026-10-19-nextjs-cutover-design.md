# Next.js production cutover

Use the unused main branch for Next.js production, seeded from canary, including
all merged master/staging fixes. Keep master and staging on Amplify during the
parallel deployment. Main pushes deploy CagPlatform-production; canary is the existing Next.js staging target. No additional staging stack is created.

Reuse the existing standalone Docker/CDK platform and credential-free checks.
Add production TLS configuration, configuration drift checks, strict branch
selection, and live validation against the new ALB before DNS changes. HTTPS
validation must preserve the public hostname/SNI while connecting to the new
ALB, since the public DNS still points at Amplify.

Provision production OIDC/CDK roles through a manually dispatched CI bootstrap
workflow using an AWS bootstrap role, with a dedicated production qualifier.
Do not expand the canary trust boundary or use developer AWS credentials.
CAG uses its existing GitHub-hosted runners; contract projects are exempt from
the operator's homelab runner rules.

Acceptance: green PR checks; automatic main deployment succeeds; new ALB health,
HTML, static assets and browser routes pass; existing production remains live;
production HTTPS/authentication work before DNS moves. If bootstrap credentials,
certificate or DNS access are unavailable, report the exact external dependency
and leave traffic on the observed working stack.
