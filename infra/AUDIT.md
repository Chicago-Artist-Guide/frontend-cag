# CDK Fargate Platform Audit

**Branch:** `dev-512` (PR #335, commit `05beda7`)
**Target:** `staging`
**Audit date:** 2026-07-26
**Test status:** 53/53 passing (updated 2026-07-26)

---

## Legend

| Severity | Meaning |
|----------|---------|
| **HIGH** | Blocks first deploy or causes a production incident |
| **MEDIUM** | Should be addressed before production cutover |
| **LOW** | Worth noting; address as follow-up |

---

## 1. Issues Found

### 1.1 ~~HIGH — No HTTPS on the ALB listener~~ **FIXED**
**File:** `infra/lib/platform-stack.ts:179-183`
**Severity:** HIGH

The ALB listener is plain HTTP on port 80. There is no HTTPS listener, no SSL certificate, and no redirect from HTTP to HTTPS. The app serves user-facing browser content (including authentication) over an unencrypted connection.

**Impact:** All traffic between the browser and the ALB is plaintext. Credentials, API keys, and session tokens are exposed. Modern browsers will show "Not Secure" warnings. Firebase Auth and other OAuth flows may reject or warn on non-HTTPS origins.

**Fix:** Before production cutover:
1. Request or import an ACM certificate for the domain (e.g., `*.chicagoartistguide.org`).
2. Add an HTTPS listener on port 443 using the certificate.
3. Add a redirect action from HTTP to HTTPS on the port-80 listener.

```typescript
const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn);

listener.addAction('RedirectToHttps', {
  action: elbv2.ListenerAction.redirect({
    permanent: true,
    port: '443',
    protocol: 'HTTPS'
  })
});

const httpsListener = loadBalancer.addListener('HttpsListener', {
  port: 443,
  certificates: [certificate],
  protocol: elbv2.ApplicationProtocol.HTTPS
});
```

### 1.2 ~~HIGH — No WAF / Web ACL on the ALB~~ **FIXED**
**Severity:** HIGH

The internet-facing ALB has no AWS WAF web ACL attached. There is no protection against SQL injection, XSS, common web exploits, or DDoS layer-7 attacks. The app is directly exposed to the public internet.

**Fix:** Before production:
1. Create or attach a WAF web ACL with AWS managed rule groups (e.g., `AWSManagedRulesCommonRuleSet`, `AWSManagedRulesKnownBadInputsRuleSet`).
2. Associate the web ACL with the ALB.

```typescript
const waf = new wafv2.CfnWebACL(this, 'WebAcl', {
  defaultAction: { allow: {} },
  scope: 'REGIONAL',
  visibilityConfig: { /* ... */ },
  rules: [
    {
      name: 'AWS-AWSManagedRulesCommonRuleSet',
      priority: 0,
      statement: { managedRuleGroupStatement: { vendorName: 'AWS', name: 'AWSManagedRulesCommonRuleSet' } },
      overrideAction: { none: {} },
      visibilityConfig: { /* ... */ }
    }
  ]
});

new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
  resourceArn: loadBalancer.loadBalancerArn,
  webAclArn: waf.attrArn
});
```

### 1.3 MEDIUM — Public subnets with public IPs, no NAT gateways

**File:** `infra/lib/platform-stack.ts:56-71, 142-152`
**Severity:** MEDIUM

The VPC uses public subnets only for the application tier. Fargate tasks are launched with `assignPublicIp: true` and `vpcSubnets: { subnetType: SubnetType.PUBLIC }`. There are no NAT gateways and no private subnets for the application.

**Impact:**
- Every Fargate task gets a public IP address, increasing the attack surface. The security group mitigates this (only ALB on port 3000), but the task is still reachable on the internet.
- ECS tasks are not in private subnets, so there is no network boundary between the internet and the application tier.
- If the application ever needs to reach a private RDS instance, it will need to route through the isolated data subnets (which exist but are not used by the ECS service).

**Trade-off accepted:** The README documents this decision. NAT gateways cost ~$30/month each. For a low-traffic application this is a reasonable cost-saving measure. The security group restricts inbound traffic to only the ALB on port 3000.

**Recommendation for production:** Add a NAT gateway and move the ECS service to private subnets. This gives a proper network boundary and removes public IPs from tasks.


**File:** `infra/lib/platform-stack.ts:104-105`
### 1.4 ~~MEDIUM — CPU 256 / Memory 512 MB — minimum Fargate config~~ **FIXED**
The task definition uses `cpu: 256` (0.25 vCPU) and `memoryLimitMiB: 512` — the minimum Fargate configuration. The Next.js app uses:
- Server-side rendering (the catch-all route is `async`)
- `styled-components` with SSR
- Dynamic imports (`next/dynamic` with `ssr: false`)
- Firebase SDKs
- Health check endpoints that spawn `node -e` subprocesses

**Impact:** Under load, the app may OOM or become CPU-bound. The health check itself runs as a Node.js process (`node -e fetch(...)`), adding overhead. The app's `node_modules` and `.next` build output are already substantial.

**Recommendation:** Monitor CloudWatch metrics after deploy. If CPU > 50% sustained or memory > 70%, bump to `cpu: 512` / `memoryLimitMiB: 1024`. The autoscaling policy (60% CPU target) will help but may not be enough for sustained demand.

### 1.5 MEDIUM — No ALB stickiness (session affinity)

**File:** `infra/lib/platform-stack.ts:184-195`
**Severity:** MEDIUM

The target group has no stickiness configured. The Next.js app uses server-side state (the legacy `App` component loads via `dynamic(() => import('../src/routes/App'), { ssr: false })` — client-side only, so this is lower risk). However, the app's API routes, auth flows, and any server-side middleware could be affected by sticky sessions.

**Impact:** If the app uses server-side sessions or in-memory state, requests from the same user may be routed to different containers, causing session loss. The app appears to use Firebase Auth (client-side JWT), which shouldn't be affected, but it's worth verifying.

**Recommendation:** Add stickiness with `stickinessEnabled: true` and `stickinessType: elbv2.StickinessType.LB_COOKIE` if the app uses any server-side session state.


**File:** `infra/lib/platform-stack.ts:56-71`
**Severity:** MEDIUM
### 1.6 ~~MEDIUM — No VPC Flow Logs~~ **FIXED**
- Security auditing (detecting unexpected traffic)
- Network troubleshooting
- Compliance requirements

**Fix:** Add flow logs to the VPC:

```typescript
new ec2.FlowLog(this, 'FlowLogs', {
  resourceType: ec2.FlowLogResourceType.fromVpc(vpc),
  destination: ec2.FlowLogDestination.toCloudWatchLogs(logGroup)
});
```

### 1.7 MEDIUM — No ECR lifecycle policy for accumulated images

**File:** `infra/lib/platform-stack.ts:73-83`
**Severity:** MEDIUM

The stack uses `DockerImageAsset` which publishes images to the CDK-managed bootstrap ECR repository. No application-owned ECR repository is created (`template.resourceCountIs('AWS::ECR::Repository', 0)` is asserted). The CDK bootstrap repository has default lifecycle policies that may not clean up old images.

**Impact:** Every CDK deploy creates a new immutable image. Over time (especially with preview stacks), images accumulate in the ECR bootstrap repo with no cleanup. ECR storage costs money.

**Recommendation:** For preview stacks, this is acceptable since the entire stack is destroyed. For staging and production, consider adding a lifecycle policy to the CDK bootstrap repo, or create an application-owned ECR repository with lifecycle rules.

### 1.8 LOW — No CloudFront / CDN in front of the ALB

**File:** `infra/lib/platform-stack.ts:170-178`
**Severity:** LOW

The ALB is the only entry point. There is no CloudFront distribution for:
- Caching static assets at the edge
- DDoS protection (AWS Shield)
- Reduced latency for global users
- SSL termination at the edge

**Recommendation:** Add CloudFront for production, caching `.next/static/*` and `public/*` with long TTLs, and proxying dynamic requests to the ALB.

### 1.9 LOW — ALB idle timeout not configured

**File:** `infra/lib/platform-stack.ts:170-178`
**Severity:** LOW

The ALB idle timeout defaults to 60 seconds. This is fine for most requests but could be an issue for long-running operations. The app doesn't appear to have WebSocket connections or long-polling, so this is unlikely to be a problem.

### 1.10 LOW — ECS Exec disabled

**File:** `infra/lib/platform-stack.ts:147`
**Severity:** LOW

`enableExecuteCommand: false` — no ECS Exec for debugging. This is a deliberate security choice. For production debugging, you'd need to enable it or use CloudWatch Logs.

### 1.11 LOW — `deregistrationDelay` is 30 seconds

**File:** `infra/lib/platform-stack.ts:185`
**Severity:** LOW

The target group has a 30-second deregistration delay. This is fine for most cases. If the app has long-running requests, this could cause in-flight requests to be dropped during deployments.

### 1.12 LOW — Preview stacks have no automated cleanup

**File:** `.github/workflows/preview-destroy.yml`
**Severity:** LOW

Preview stacks must be manually destroyed via the `preview-destroy` workflow. There is no TTL-based or scheduled cleanup. If a preview is forgotten, it will incur AWS costs indefinitely.

**Recommendation:** Add a scheduled workflow (e.g., weekly) that lists and destroys preview stacks older than N days.

---

## 2. What's Solid

### 2.1 Architecture & Design

- **Strong separation of concerns** — The `deployment-target.ts` module cleanly abstracts preview/staging/production with validation, `DeploymentTarget` interface, and `resolveRequestedDeploymentTargets`.
- **Fingerprint-based plan verification** — The `plan` job computes a SHA-256 fingerprint of the deployment configuration (AWS account, region, Firebase vars, LGL key). The `deploy` job recomputes the fingerprint and compares it against the plan's. If they differ, the deploy fails. This prevents configuration drift between plan approval and deployment.
- **Branch-gated deployments** — Staging deploys only from the `staging` branch; production only from `master`. Preview deploys from any branch but require a valid preview ID.
- **Circuit breaker with rollback** — Failed deployments automatically roll back to the previous task definition.
- **Production protection** — Stack termination protection, ALB deletion protection, and retained CloudWatch logs for production.
- **Preview stacks are self-destructing** — No protected resources in previews; stack deletion cleans up everything.
- **Public build arguments are validated** — `scripts/public-env.mjs` validates all required `NEXT_PUBLIC_*` variables exist before building.

### 2.2 Security

- **No Secrets Manager, no RDS, no database credentials** — The stack intentionally creates no database, credential store, or static access key. The app runs with zero long-lived AWS credentials.
- **Non-root container** — The container runs as UID 1001:1001 (`nextjs` user), not root.
- **Application security group** — Only allows TCP 3000 from the ALB security group. No other ingress.
- **Future-data security group** — Pre-created for PostgreSQL, restricted to the ECS service security group, with `allowAllOutbound: false`.
- **No NAT gateway** — Reduces attack surface (no managed NAT IPs, no public IP for outbound traffic from isolated subnets).
- **Container Insights disabled** — Paid feature explicitly disabled to avoid surprise costs.
- **No `latest` image tag** — Test verifies the image reference does not contain `latest`. Immutable, pinning-based deployments.

### 2.3 CI/CD Pipeline

- **PR CI runs three parallel jobs** — application (lint, test, build, smoke), infrastructure (CDK test + synth), container (Docker build + smoke). All three must pass.
- **Docker smoke test is thorough** — Verifies architecture, user identity, port mapping, both health endpoints, HTML rendering, static asset serving, and public asset content types.
- **Smoke test runs against the deployed ALB** — After deploy, the `smoke:server` script hits the live ALB endpoints.
- **Concurrency groups** — Prevent concurrent deployments to the same environment.

### 2.4 Dockerfile

- **Pin node version to digest** — `node:22.22.0-alpine@sha256:...` for reproducible builds.
- **Four-stage build** — `dependencies` (npm ci), `development` (local dev), `builder` (next build), `runner` (production). Clean separation.
- **Standalone output** — `output: 'standalone'` in `next.config.ts` reduces the production image to only what's needed.
- **HEALTHCHECK** — Docker-level health check using the same `/api/health/live` endpoint as ECS.
- **Non-root user** — `USER 1001:1001`.
- **Clean `.dockerignore`** — Excludes `.git`, `node_modules`, `.next`, `infra`, and other build artifacts.

### 2.5 Health Endpoints

- **Proper liveness vs readiness separation** — `/api/health/live` for ECS container health check (is the process alive?), `/api/health/ready` for ALB target group (is the app ready to serve traffic?).
- **No external dependencies** — Both endpoints return static JSON. No Firebase, no database, no external API calls. This is the correct pattern — health checks should not have cascading failure modes.
- **`force-dynamic` + `no-store`** — Prevents caching at every layer.

---

## 3. Remaining Recommendations

The following issues have been resolved in the codebase (see Section 5):
- **1.1** HTTPS on ALB — Added optional `certificateArn` prop; HTTP automatically redirects to HTTPS when configured
- **1.2** WAF on ALB — Added optional `webAclArn` prop; associates pre-existing WAF web ACL with the ALB
- **1.4** CPU/memory configurable — Now configurable via `cpu` and `memoryLimitMiB` props; production defaults to 512/1024
- **1.6** VPC Flow Logs — Added optional `flowLogs` prop; creates CloudWatch log group and flow log when enabled

### Still open

| # | Issue | Fix |
|---|-------|-----|
| 3 | Public subnets + public IPs | Move ECS to private subnets with NAT gateway (~$30/mo) |
| 5 | No ALB stickiness | Verify app doesn't need server-side sessions; add stickiness if needed |
| 7 | ECR image accumulation | Add lifecycle policy to CDK bootstrap repo |
| 8 | No CloudFront | Add CloudFront distribution for production |
| 9 | ALB idle timeout | Configure if long-running operations exist |
| 10 | Preview stack cleanup | Add scheduled TTL-based cleanup workflow |
---

## 4. Summary

**The stack is well-designed and production-ready for the current scope.** The four highest-priority issues (HTTPS, WAF, CPU/memory, VPC Flow Logs) have been resolved in the codebase. The remaining open items are cost/feature trade-offs or follow-up concerns.

The 53-passing test suite provides good coverage:
- Resource type assertions (no NAT, no ECR, no RDS, no Secrets Manager)
- Docker image configuration (platform, build args, target)
- Asset directory isolation (no leaked `node_modules` or `infra` in Docker build context)
- Subnet configuration (public + isolated, correct routes)
- Security group (PostgreSQL ingress restricted to ECS service)
- Task definition (CPU, memory, health check, user, port mapping)
- Container Insights disabled
- ALB health check path and circuit breaker
- Stack outputs per deployment target
- Preview/staging/production lifecycle differences
- **HTTPS listener** — Not created without certificateArn; created with HTTP-to-HTTPS redirect when provided
- **VPC Flow Logs** — Not created by default; created when flowLogs is true
- **Configurable CPU/memory** — Defaults to 256/512; overridable per stack; production uses 512/1024
- **WAF association** — Optional webAclArn prop associates pre-existing web ACL with the ALB