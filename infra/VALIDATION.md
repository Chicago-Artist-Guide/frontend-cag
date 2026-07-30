# Validation Report — Audit & Deployment Walkthrough

**Branch:** `dev-512` (PR #335, commit `05beda7`)
**Reviewed:** 2026-07-26
**Audit:** `infra/AUDIT.md`
**Walkthrough:** `infra/DEPLOYMENT_WALKTHROUGH.md`

---

## Issues in the Audit

### HIGH — ACM certificate validation method not addressed

The audit says "Request or import an ACM certificate" but never discusses **how** to validate it. DNS is at Google Domains, not Route53 — there is **no Route53 hosted zone** for DNS validation. ACM certificates MUST use **email validation** (or the user must create a Route53 zone and delegate). The audit's fix code snippet assumes DNS validation by calling `acm.Certificate.fromCertificateArn()` — this is correct for the import path, but the prerequisite (email validation workflow) is completely undocumented. This affects both the audit and the walkthrough.

### HIGH — Plan job fails on any `cdk diff` difference

The `deploy-environment.yml` and `preview-deploy.yml` workflows both run `cdk diff` in the `plan` job with:

```yaml
if ! npm exec cdk -- diff ... ; then
  cat "$diff_file"
  exit 1
fi
```

`cdk diff` returns exit code **1** when differences exist. The `!` negates it to 0, entering the `if` block and calling `exit 1`. This means the **plan job fails on any legitimate change** — the very thing it's supposed to review. The workflow works only for the first deploy (when the stack doesn't exist, `cdk diff` returns 0) and breaks on every subsequent update. The audit completely missed this pipeline-blocking bug.

**Fix:** The `plan` job should show the diff as a review artifact without failing:

```yaml
- name: Diff exact CDK stack
  run: |
    npm exec cdk -- diff "$STACK_NAME" \
      --context "stage=$TARGET_STAGE" > "$diff_file" 2>&1 || true
    cat "$diff_file"
    {
      echo "## CDK diff: $STACK_NAME"
      echo '```text'
      cat "$diff_file"
      echo '```'
    } >> "$GITHUB_STEP_SUMMARY"
```

### MEDIUM — HTTPS fix code is incomplete

The audit's fix code (Section 1.1) drops standalone code into the constructor but doesn't address the interface change needed. The stack currently has **no `certificateArn` prop** in `PlatformStackProps`. Adding HTTPS requires:

1. Adding `certificateArn?: string` to `PlatformStackProps`
2. Conditionally creating the HTTPS listener and redirect only when `certificateArn` is provided
3. The `LoadBalancerUrl` output (line 233) will return `http://` even after HTTPS is added — it needs to be conditional

### MEDIUM — `LoadBalancerUrl` output is always `http://`

Line 233: `value: \`http://${loadBalancer.loadBalancerDnsName}\``. This output is consumed by `read-cdk-output.mjs` to produce `base_url` for the smoke test. When HTTPS is added, the smoke test URL will be wrong. The output should be `https://` when a certificate is present, or a second `LoadBalancerHttpsUrl` output should be added.

### MEDIUM — `minHealthyPercent: 100` with `desiredCount: 1` constrains deployments

The service sets `minHealthyPercent: 100` and `desiredCount: 1`. With the default `maxHealthyPercent: 200`, ECS can temporarily run 2 tasks during a rolling update — so zero-downtime should work. But any hiccup (new task failing health check, slow image pull) means the **single healthy task is the minimum** — there's no buffer. The audit should flag this as a deployment resilience consideration, especially for production.

### LOW — `deregistrationDelay: 30` is below AWS default (300s)

The audit rates this LOW and says "fine for most cases." This is correct for this app (no long-running requests). Worth noting: 30 seconds means in-flight requests have only 30s to complete during a deploy. This should be explicitly called out as a deliberate choice, not a default.

### LOW — No `cdk-nag` or compliance scanning

The pipeline has no `cdk-nag` (or similar) for security/compliance rule checking. The audit correctly notes the WAF and HTTPS gaps, but a compliance scanner would catch these automatically. Worth a follow-up item.

---

## Issues in the Deployment Walkthrough

### HIGH — `cdk rollback` is not a valid command

Section 3.5, Option A:

```bash
npm exec cdk -- rollback --context stage=production
```

There is **no `cdk rollback` command**. The walkthrough even notes "CDK rollback is not always available" — it's never available because it doesn't exist. The correct procedure is:

- **Option A (actual):** `aws cloudformation rollback-stack --stack-name CagPlatform-production` (CloudFormation native rollback)
- **Option B (re-deploy old code):** correct as written
- **Option C (ECS task definition rollback):** correct as written

### HIGH — Production DNS record references Route53, but DNS is at Google Domains

Section 3.1, prerequisite checklist: "**DNS record** — Route53 A record (ALIAS) created for the production domain."

The DNS is at **Google Domains**, not Route53. There is **no Route53 hosted zone**. Google Domains does not support Route53 ALIAS records. The production DNS record must be created at **Google Domains** (as a CNAME or A record pointing to the ALB DNS name). The walkthrough's Route53 commands in Section 2.5 are explicitly labeled as optional ("If a staging subdomain is desired") — this is fine for staging. But the production prerequisite is wrong.

### MEDIUM — OIDC trust policy JSON has unexpanded shell variable

Section 0.2, Step 2:

```json
"Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/..."
```

This is written to a file (`oidc-trust-policy.json`) and then used with `aws iam create-role`. The `${AWS_ACCOUNT_ID}` is a shell variable that **will not be expanded** inside a JSON file. The `aws iam create-role` command reads the file verbatim. The walkthrough should either:

- Use `envsubst` to expand the variable: `envsubst < oidc-trust-policy.json | aws iam create-role --cli-input-json -`
- Or instruct the user to replace `${AWS_ACCOUNT_ID}` with the actual account ID in the JSON

### MEDIUM — ACM email validation not documented

Section 3.1 says "**HTTPS certificate** — ACM certificate requested/imported for the production domain" but never explains **how** to get the certificate. Since DNS is at Google Domains (no Route53 zone), the user must:

1. Request an ACM certificate in `us-east-1` (for CloudFront) or the ALB's region
2. Select **email validation** (not DNS validation)
3. Approve the validation email sent to `admin@chicagoartistguide.org` or the domain's WHOIS contact
4. Export the certificate ARN and pass it to the stack

This is a non-obvious blocking step that the walkthrough should spell out.

### MEDIUM — Rollback via `git checkout` rebuilds the Docker image from scratch

Section 3.5, Option B: "Checkout the previous commit... Re-deploy." The walkthrough doesn't mention that `cdk deploy` will **rebuild the entire Docker image**, which takes 5-10 minutes. For emergency rollbacks, Option C (ECS task definition rollback) is faster (seconds) and should be listed first. The walkthrough has them in the wrong priority order.

### LOW — Docker must be running for `cdk deploy`

The walkthrough doesn't mention that `cdk deploy` builds a Docker image locally. If Docker isn't running, the deploy fails with an opaque error. Worth noting in the prerequisites.

### LOW — `cdk bootstrap` with `--context` parameter

The bootstrap command includes `--context stage=staging`. `cdk bootstrap` doesn't use an app, so this parameter is silently ignored. Not harmful, but misleading. The bootstrap command doesn't need any context.

### LOW — `smoke:server` defined in root `package.json`, not `infra/`

The walkthrough references `npm run smoke:server` from the repo root. After `cd infra`, this command is not available. The smoke test should be run from the repo root, not from `infra/`. The walkthrough has `cd infra` earlier but the smoke test commands assume the repo root.

---

## What's Solid and Correct

### Audit

- **All 12 issues identified are real and correctly scoped** — HTTPS, WAF, public subnets, CPU/memory, stickiness, flow logs, ECR lifecycle, CloudFront, idle timeout, ECS Exec, deregistration delay, preview cleanup. The severity ratings are appropriate (with the nuance that WAF is MEDIUM for staging).
- **"What's Solid" section (2.1-2.5) is accurate** — The architecture, security posture, CI/CD pipeline, Dockerfile, and health endpoints are all correctly praised.
- **Recommended fixes table (Section 3) is well-organized** — Required before production, strongly recommended before staging, recommended before production. Good separation.
- **Summary paragraph is accurate** — The stack is well-designed and production-ready for the current scope.

### Walkthrough

- **Stage structure is logical** — Preview → Staging → Production is the right order.
- **OIDC setup commands are correct** — The `create-open-id-connect-provider` and `create-role` commands (minus the JSON variable issue) are accurate.
- **GitHub environment setup is correct** — The 7 environments match the workflow files.
- **CDK bootstrap command is correct** — Includes `--cloudformation-execution-policies` (required).
- **Preview deploy/verify/destroy commands are correct** — Stack names, context parameters, and verification steps match the code.
- **Staging deploy commands are correct** — Matches `deploy-environment.yml`.
- **Log group names are correct** — `/cag/{deploymentId}/frontend` matches the stack code.
- **Smoke test verification is correct** — The expected responses (`"status": "ok"`, `"status": "ready"`) match the endpoints.
- **ECS service verification commands are correct** — Cluster names, service names, and query paths match.
- **Firebase Authorized Domains note is correct** — Staging ALB needs to be added to Firebase Auth settings.
- **Post-deploy checklist (Section 3.6) is comprehensive** — Covers health, rendering, static assets, logs, ECS, ALB, autoscaling.
- **Ongoing operations section (Section 4) is thorough** — Logs, service health, app updates, ECS events, teardown.
- **Quick reference table is accurate** — All commands match the codebase.

### Stack Code

- **Fingerprint-based plan verification** — The `deployment-config.mjs` script correctly fingerprints all 8 configuration values (AWS account, region, 6 public build args). The fingerprint comparison between plan and deploy jobs prevents configuration drift.
- **Branch-gated deployments** — `deployment-target.mjs` validates that staging runs from `staging` branch and production from `master` branch.
- **Preview/staging/production lifecycle differences** — Termination protection, deletion protection, log retention, and autoscaling max are all correctly differentiated by `isProduction` and `isEphemeral`.
- **Security group isolation** — Application SG only allows TCP 3000 from ALB SG. Future-data SG restricts PostgreSQL to ECS service SG with `allowAllOutbound: false`.
- **No unnecessary resources** — No NAT gateway, no RDS, no Secrets Manager, no ECR repo, no Container Insights. Test suite verifies these assertions.
- **Dockerfile** — Four-stage build, pinned digest, standalone output, non-root user, HEALTHCHECK, clean `.dockerignore`.
- **Health endpoints** — Proper liveness (`/api/health/live`) vs readiness (`/api/health/ready`) separation, `force-dynamic` + `no-store`, no external dependencies.

---

## Final Verdict

**Deployable with fixes.** Two issues block the first successful deploy:

1. **`cdk diff` exit code handling** in the `plan` job — the pipeline will fail on any subsequent change. Fix the `if ! cdk diff` pattern to `|| true`.
2. **`cdk rollback` command does not exist** in the walkthrough — replace with `aws cloudformation rollback-stack`.

Three issues block the **production** cutover:

1. **ACM certificate validation** — Must use email validation (no Route53). Not documented anywhere.
2. **Production DNS record** — Must be created at Google Domains, not Route53. Walkthrough says "Route53 A record (ALIAS)" which is wrong.
3. **OIDC trust policy JSON** — Shell variable `${AWS_ACCOUNT_ID}` won't expand inside a JSON file. Fix the command.

The stack itself is well-designed. The structural issues are in the **CI/CD pipeline logic** and **documentation**, not the infrastructure code. The 46-passing test suite provides strong coverage. The audit's core findings are correct; the gaps are in the ACM certification path and the pipeline bug.

**Recommended order:**
1. Fix `cdk diff` exit code in both workflow files (blocks all subsequent deploys)
2. Fix `cdk rollback` → `aws cloudformation rollback-stack` in walkthrough (incorrect docs)
3. Document ACM email validation and OIDC trust policy fixes in walkthrough
4. Fix `LoadBalancerUrl` output to be HTTPS-aware
5. Add `certificateArn` to `PlatformStackProps` for HTTPS support
6. Then proceed with preview → staging → production per the walkthrough