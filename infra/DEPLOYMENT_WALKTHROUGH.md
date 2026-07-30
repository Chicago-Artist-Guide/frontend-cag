# Deployment Walkthrough — CDK Fargate Platform

**Target:** PR #335 (`dev-512` → `staging`)
**Deploy date:** 2026-07-27
**Audit reference:** `infra/AUDIT.md`

---

## Table of Contents

- [Stage 0: Prerequisites](#stage-0-prerequisites)
- [Stage 1: Preview Deploy](#stage-1-preview-deploy)
- [Stage 2: Staging Deploy](#stage-2-staging-deploy)
- [Stage 3: Production Deploy](#stage-3-production-deploy)
- [Stage 4: Ongoing Operations](#stage-4-ongoing-operations)
- [Verification Commands Reference](#verification-commands-reference)

---

## Stage 0: Prerequisites

### 0.1 AWS Account Setup

Before any CDK deployment, the target AWS account must be configured.

```bash
# Set your target account and region (adjust as needed)
export AWS_ACCOUNT_ID="123456789012"
export AWS_REGION="us-east-1"

# Verify AWS CLI is configured
aws sts get-caller-identity
# Expected output (example):
# {
#   "UserId": "AIDA...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/...-oidc"
# }
```

### 0.2 GitHub OIDC Provider Setup

The CI/CD workflows use GitHub OIDC for AWS access. This must be set up once per account.

**Step 1: Create the OIDC identity provider**

```bash
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
```

**Step 2: Create the IAM role**

Create a trust policy file `oidc-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Federated": "arn:aws:iam::AWS_ACCOUNT_ID_PLACEHOLDER:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:chicagoartistguide/frontend-cag:*"
        }
      }
    }
  ]
}
```

```bash
# Replace the placeholder with your actual account ID, then create the role
sed "s/AWS_ACCOUNT_ID_PLACEHOLDER/$AWS_ACCOUNT_ID/g" oidc-trust-policy.json | \
  aws iam create-role \
    --role-name "CagGithubOidcDeployRole" \
    --cli-input-json -

# Attach the AWS managed CDK deployment policy
aws iam attach-role-policy \
  --role-name "CagGithubOidcDeployRole" \
  --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess"

# Note: In production, scope this to a least-privilege policy
# with only the permissions the CDK stack needs.
```

**Step 3: Configure GitHub repository variables**

In the GitHub repository settings (`Settings > Secrets and variables > Actions`), set these **repository variables**:

| Variable | Value |
|----------|-------|
| `AWS_ACCOUNT_ID` | `123456789012` |
| `AWS_REGION` | `us-east-1` |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/CagGithubOidcDeployRole` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (production value) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (production value) |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (production value) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (production value) |
| `NEXT_PUBLIC_FIREBASE_SENDER_ID` | (production value) |
| `NEXT_PUBLIC_LGL_API_KEY` | (production value) |

**Important:** These are `vars` (plain-text variables), not `secrets`. The workflow reads them as `${{ vars.AWS_ACCOUNT_ID }}`. The `NEXT_PUBLIC_*` values are public browser configuration and are intentionally not secrets.

**Production environment variables (secrets):** These are set as `secrets` in the `production` GitHub environment, not as repository variables. They must be configured before the first production deploy:

| Variable | Value |
|----------|-------|
| `CERTIFICATE_ARN` | ACM certificate ARN (from 3.0.1) |
| `WEB_ACL_ARN` | WAF web ACL ARN (from 3.0.2) |
| `FLOW_LOGS` | `true` |

The deployment workflow reads these as `${{ secrets.CERTIFICATE_ARN }}` for the production environment only. Preview and staging deployments do not use these values.

### 0.3 GitHub Environments Setup

The workflows reference these GitHub environments. They must exist in the repository settings:

| Environment | Used by | Purpose |
|-------------|---------|---------|
| `preview-plan` | preview-deploy.yml | OIDC credential scope for preview plan |
| `preview` | preview-deploy.yml | OIDC credential scope for preview deploy |
| `preview-destroy` | preview-destroy.yml | OIDC credential scope for preview destroy |
| `staging-plan` | deploy-environment.yml | OIDC credential scope for staging plan |
| `staging` | deploy-environment.yml | OIDC credential scope for staging deploy |
| `production-plan` | deploy-environment.yml | OIDC credential scope for production plan |
| `production` | deploy-environment.yml | OIDC credential scope for production deploy |

Each environment should have:
- **No required reviewers** for staging/preview (optional for production)
- **Environment secrets** (none needed — all config is in `vars`)

### 0.4 CDK Bootstrap

CDK must be bootstrapped once per account/region before any deployment:

```bash
# From the repo root
cd infra

# Install dependencies
npm ci

# Bootstrap (requires AWS credentials with admin permissions)
npm exec cdk -- bootstrap \
  --context stage=staging \
  --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess"

# Verify bootstrap
npm exec cdk -- list --context stage=staging
# Expected: CagPlatform-staging
```

The bootstrap command:
- Creates the CDK staging bucket and ECR repository
- Configures the execution role for CloudFormation
- Is idempotent — safe to re-run

### 0.5 Required Environment Variables (Local CLI)

For local CDK commands, these environment variables are required:

```bash
export NEXT_PUBLIC_FIREBASE_API_KEY="<value>"
export NEXT_PUBLIC_FIREBASE_APP_ID="<value>"
export NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="<value>"
export NEXT_PUBLIC_FIREBASE_PROJECT_ID="<value>"
export NEXT_PUBLIC_FIREBASE_SENDER_ID="<value>"
export NEXT_PUBLIC_LGL_API_KEY="<value>"
```

All six must be set to non-empty strings. The build will fail if any are missing.

**Production-only environment variables:** When deploying to production, these additional variables enable HTTPS, WAF, and VPC Flow Logs. They are optional for preview and staging (HTTPS, WAF, and flow logs are not created for those environments).

```bash
export CERTIFICATE_ARN="arn:aws:acm:us-east-1:...:certificate/..."
export WEB_ACL_ARN="arn:aws:wafv2:us-east-1:...regional/webacl/..."
export FLOW_LOGS="true"
```

These are set automatically by the GitHub Actions workflow for production deployments. See [Stage 3: Production Deploy](#stage-3-production-deploy) for details on creating the ACM certificate and WAF web ACL.
---

## Stage 1: Preview Deploy

Deploy a preview stack to validate the infrastructure works end-to-end before touching staging.

### 1.1 Synthesize the Preview Stack

```bash
cd infra

# Synthesize the CloudFormation template (no AWS credentials needed)
npm exec cdk -- synth \
  --context stage=preview \
  --context "previewId=dev-512"
```

This creates the CloudFormation template in `cdk.out/`. Review the output to verify the expected resources.

### 1.2 Deploy the Preview Stack

```bash
# Ensure all required env vars are set (see 0.5)
export NEXT_PUBLIC_FIREBASE_API_KEY="..."
# ... set all six ...

# Deploy the preview stack
npm exec cdk -- deploy \
  --context stage=preview \
  --context "previewId=dev-512" \
  --outputs-file /tmp/cdk-outputs.json \
  --require-approval never
```

The deploy takes approximately **5-10 minutes**:
1. CDK uploads the Docker image to the bootstrap ECR repository (~2-3 min)
2. CloudFormation creates the stack: VPC, security groups, ECS cluster, task definition, service, ALB (~3-5 min)
3. ECS launches the Fargate task (~1-2 min)

### 1.3 Verify the ALB

```bash
# Read the outputs
cat /tmp/cdk-outputs.json | jq '."CagPlatform-preview-dev-512"'

# Set the ALB URL
export BASE_URL="http://$(cat /tmp/cdk-outputs.json | jq -r '."CagPlatform-preview-dev-512".LoadBalancerDnsName')"
echo "ALB URL: $BASE_URL"

# Wait for the ALB to be provisioned (DNS propagation takes ~30s)
# Then verify the health endpoints
curl -s "$BASE_URL/api/health/live" | jq .
# Expected: { "status": "ok" }

curl -s "$BASE_URL/api/health/ready" | jq .
# Expected: { "status": "ready" }

# Verify the app serves HTML
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/"
# Expected: 200

# Verify the app renders content
curl -s "$BASE_URL/" | head -50
# Expected: HTML with <!DOCTYPE html>
```

### 1.4 View CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix "/cag/preview-dev-512"

# Tail the application logs
aws logs tail "/cag/preview-dev-512/frontend" --follow
# Expected: Next.js startup logs, request logs
```

### 1.5 Run the Smoke Test Suite

```bash
# Run the same smoke test used in CI
BASE_URL="$BASE_URL" npm run smoke:server
```

This verifies:
- `/api/health/live` returns `{ status: "ok" }` (200)
- `/api/health/ready` returns `{ status: "ready" }` (200)
- `/home` route renders HTML
- `/about-us` route renders HTML
- At least one `/_next/static/` asset is referenced in the HTML
- The static asset is served successfully (200)
- `/images/cagLogo1.svg` is served as `image/svg+xml`
- `/images/donate/stage_bow.png` is served as `image/png`

### 1.6 ECS Service Verification

```bash
# List ECS tasks
aws ecs list-tasks --cluster CagPlatform-preview-dev-512

# Describe the running task
aws ecs describe-tasks \
  --cluster CagPlatform-preview-dev-512 \
  --tasks $(aws ecs list-tasks --cluster CagPlatform-preview-dev-512 --query 'taskArns[0]' --output text)

# Check the task status (should be RUNNING)
aws ecs describe-tasks \
  --cluster CagPlatform-preview-dev-512 \
  --tasks $(aws ecs list-tasks --cluster CagPlatform-preview-dev-512 --query 'taskArns[0]' --output text) \
  --query 'tasks[0].lastStatus'
```

### 1.7 Clean Up the Preview

```bash
# Destroy the preview stack
npm exec cdk -- destroy \
  --context stage=preview \
  --context "previewId=dev-512" \
  --force
```

Or use the GitHub workflow: `Actions > Preview destroy > Run workflow` with `preview_id: dev-512`.

---

## Stage 2: Staging Deploy

### 2.1 Prerequisites

- [x] Preview deploy verified (Stage 1)
- [x] PR #335 merged into `staging` branch
- [x] AWS credentials configured for OIDC (or local CLI)
- [x] Required environment variables set (see 0.5)

### 2.2 Local Staging Deploy (CLI)

```bash
cd infra

# Ensure all required env vars are set (see 0.5)
export NEXT_PUBLIC_FIREBASE_API_KEY="..."
# ... set all six ...

# Bootstrap (if not already done)
npm exec cdk -- bootstrap --context stage=staging

# Synthesize
npm exec cdk -- synth --context stage=staging

# Deploy
npm exec cdk -- deploy \
  --context stage=staging \
  --outputs-file /tmp/cdk-outputs.json \
  --require-approval never
```

### 2.3 GitHub Workflow Deploy (Recommended)

1. Merge PR #335 into `staging`
2. Go to `Actions > Deploy durable environment`
3. Select `staging`
4. Click `Run workflow`

The workflow will:
1. **Validate** — Verify the branch is `staging`, run `npm run verify`
2. **Plan** — Assuming the OIDC role, run `cdk diff` with the fingerprint
3. **Deploy** — Assuming the OIDC role, verify the fingerprint matches, run `cdk deploy`
4. **Smoke** — Run `smoke:server` against the deployed ALB

### 2.4 Verify Staging

```bash
# Read the outputs
cat /tmp/cdk-outputs.json | jq '."CagPlatform-staging"'

export BASE_URL="http://$(cat /tmp/cdk-outputs.json | jq -r '."CagPlatform-staging".LoadBalancerDnsName')"

# Verify health endpoints
curl -s "$BASE_URL/api/health/live" | jq .
curl -s "$BASE_URL/api/health/ready" | jq .

# Run smoke test
BASE_URL="$BASE_URL" npm run smoke:server

# View logs
aws logs tail "/cag/staging/frontend" --follow
```

### 2.5 DNS Considerations

The staging environment uses the ALB DNS name directly (`http://<alb-dns>.elb.amazonaws.com`). No Route53 record is created by this stack.

If a staging subdomain is desired:
```bash
# Create a Route53 CNAME or ALIAS record
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "staging.chicagoartistguide.org",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "'$(aws elbv2 describe-load-balancers \
            --names CagPlatform-staging \
            --query 'LoadBalancers[0].CanonicalHostedZoneId' \
            --output text)'",
          "DNSName": "'$(aws elbv2 describe-load-balancers \
            --names CagPlatform-staging \
            --query 'LoadBalancers[0].DNSName' \
            --output text)'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

### 2.6 Firebase Authorized Domains

If the staging environment needs Firebase Auth to work, add the ALB URL to the Firebase console:
1. Go to [Firebase Console](https://console.firebase.google.com/) > Authentication > Settings
2. Add the ALB DNS name (e.g., `CagPlat-1abcdef123456-789012345.us-east-1.elb.amazonaws.com`) to Authorized domains
3. **Note:** This is not needed if Firebase Auth is configured to work with the production domain only

---

## Stage 3: Production Deploy

### 3.0 Pre-Production Setup

#### 3.0.1 ACM Certificate (Email Validation)

Since DNS is managed at Google Domains (not Route53), ACM certificates must use **email validation**. Create the certificate manually:

```bash
aws acm request-certificate \
  --domain-name "chicagoartistguide.org" \
  --subject-alternative-names "*.chicagoartistguide.org" \
  --validation-method EMAIL \
  --region us-east-1
```

After running this command, AWS will send validation emails to the domain's registered email addresses (admin@, hostmaster@, postmaster@, webmaster@, etc.). You must click the validation link in the email before the certificate is issued.

Once issued, export the ARN:

```bash
aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[?DomainName==`chicagoartistguide.org`].CertificateArn' --output text
```

**Note:** ACM certificates in `us-east-1` are required for CloudFront. Since the ALB is also in `us-east-1`, the same region works for both.

#### 3.0.2 WAF Web ACL

Create a WAF web ACL with AWS managed rule groups. This runs once and is reused across deployments:

```bash
aws wafv2 create-web-acl \
  --name "CagWebAcl" \
  --scope REGIONAL \
  --default-action Allow={} \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=CagWebAcl \
  --rules '[
    {
      "Name": "AWS-AWSManagedRulesCommonRuleSet",
      "Priority": 0,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "OverrideAction": { "None": {} },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "CagCommonRuleSet"
      }
    },
    {
      "Name": "AWS-AWSManagedRulesKnownBadInputsRuleSet",
      "Priority": 1,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesKnownBadInputsRuleSet"
        }
      },
      "OverrideAction": { "None": {} },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "CagKnownBadInputs"
      }
    }
  ]'
```

Export the ARN:

```bash
export WEB_ACL_ARN=$(aws wafv2 list-web-acls --scope REGIONAL --query 'WebACLs[?Name==`CagWebAcl`].ARN' --output text)
```


### 3.1 Prerequisites

**Before deploying to production, the following must be completed:**

- [x] Staging deploy verified and working (Stage 2)
- [x] All user acceptance testing (UAT) passes on staging
- [x] **ACM certificate** issued and verified (see 3.0.1)
- [x] **WAF web ACL** created (see 3.0.2)
- [ ] **CPU/memory monitoring** — CloudWatch alarms configured
- [ ] **DNS record** — A record created at Google Domains pointing to the ALB DNS name
- [ ] **Firebase authorized domains** — Production domain added to Firebase Auth
- [ ] **PR #335 merged into `master`** — Production deployment is gated on the `master` branch

### 3.2 Deploy via GitHub Workflow

1. Go to `Actions > Deploy durable environment`
2. Select `production`
3. Click `Run workflow`

The workflow validates:
- The branch is `master` (enforced by `deployment-target.mjs`)
- The configuration fingerprint matches the plan
- The smoke test passes after deploy

### 3.3 Local Production Deploy (Emergency Only)

```bash
# Only if the GitHub workflow is unavailable
cd infra

# Ensure all required env vars are set with production values
export NEXT_PUBLIC_FIREBASE_API_KEY="<production-value>"
# ... set all six ...

# HTTPS + WAF + Flow Logs (required for production — see 3.0.1 and 3.0.2)
export CERTIFICATE_ARN="arn:aws:acm:us-east-1:...:certificate/..."
export WEB_ACL_ARN="arn:aws:wafv2:us-east-1:...regional/webacl/..."
export FLOW_LOGS="true"

# Deploy
npm exec cdk -- deploy \
  --context stage=production \
  --outputs-file /tmp/cdk-outputs.json \
  --require-approval never
```

### 3.4 Verification

```bash
# Read the outputs
export BASE_URL="$(cat /tmp/cdk-outputs.json | jq -r '."CagPlatform-production".LoadBalancerUrl')"
echo "ALB URL: $BASE_URL"

# Verify health endpoints
curl -s "$BASE_URL/api/health/live" | jq .
curl -s "$BASE_URL/api/health/ready" | jq .

# Run smoke test (uses the URL from LoadBalancerUrl output)
BASE_URL="$BASE_URL" npm run smoke:server

# View logs
aws logs tail "/cag/production/frontend" --follow

# Check ECS service status
aws ecs describe-services \
  --cluster CagPlatform-production \
  --services CagPlatform-production-CagService \
  --query 'services[0].{status: status, runningCount: runningCount, desiredCount: desiredCount, events: events[0:3]}'
```

### 3.5 Rollback Procedure

**Rollback strategy:** The CDK stack uses `circuitBreaker: { rollback: true }` for automatic rollback on failed deployments. For manual rollback, use one of these methods (listed in order of speed):

**Option A (fastest — seconds): Update the ECS service to the previous task definition**

```bash
# Find the previous task definition revision
aws ecs list-task-definitions \
  --family-prefix CagPlatform-production-CagTaskDefinition \
  --sort DESC \
  --max-items 2

# Update the service to use the previous revision
aws ecs update-service \
  --cluster CagPlatform-production \
  --service CagPlatform-production-CagService \
  --task-definition CagPlatform-production-CagTaskDefinition:<N-1> \
  --force-new-deployment
```

**Option B (medium — minutes): Rollback the CloudFormation stack**

```bash
# List stack events to find the last successful deployment
aws cloudformation describe-stack-events \
  --stack-name CagPlatform-production \
  --query 'StackEvents[?ResourceStatus==`UPDATE_COMPLETE`].{Time: Timestamp, Id: LogicalResourceId}' \
  --max-items 5

# Rollback the stack to the previous known-good template
aws cloudformation rollback-stack \
  --stack-name CagPlatform-production
```

**Option C (slowest — 5-10 min): Re-deploy previous code version**

```bash
# Checkout the previous commit
git checkout <previous-commit-hash>

# Re-deploy (rebuilds the Docker image — takes 5-10 minutes)
cd infra
npm exec cdk -- deploy \
  --context stage=production \
  --outputs-file /tmp/cdk-outputs.json \
  --require-approval never
```

### 3.6 Post-Deploy Checklist

| Check | Command/Verification |
|-------|---------------------|
| Health endpoints | `curl -s $BASE_URL/api/health/live` and `/api/health/ready` |
| App renders | `curl -s $BASE_URL/ | grep -c 'Chicago Artist Guide'` |
| Static assets | `curl -s -o /dev/null -w "%{http_code}" $BASE_URL/favicon-32x32.png` → 200 |
| CloudWatch logs | `aws logs tail "/cag/production/frontend"` → no errors |
| ECS service stable | `aws ecs describe-services --cluster CagPlatform-production --services <service>` → `runningCount == desiredCount` |
| ALB healthy targets | `aws elbv2 describe-target-health --target-group-arn <arn>` → all `healthy` |
| Autoscaling | `aws application-autoscaling describe-scalable-targets --service-namespace ecs` → `MinCapacity=1, MaxCapacity=4` |

---

## Stage 4: Ongoing Operations

### 4.1 View Logs

```bash
# Tail production logs
aws logs tail "/cag/production/frontend" --follow

# Tail staging logs
aws logs tail "/cag/staging/frontend" --follow

# Search logs for errors
aws logs filter-log-events \
  --log-group-name "/cag/production/frontend" \
  --filter-pattern "ERROR" \
  --limit 20

# View logs from the last hour
aws logs tail "/cag/production/frontend" \
  --since 3600 \
  --format short
```

### 4.2 Check Service Health

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster CagPlatform-production \
  --services CagPlatform-production-CagService \
  --query 'services[0].{status: status, desired: desiredCount, running: runningCount, pending: pendingCount}'

# Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups \
    --load-balancer-arn $(aws elbv2 describe-load-balancers \
      --names CagPlatform-production \
      --query 'LoadBalancers[0].LoadBalancerArn' \
      --output text) \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)

# Check autoscaling
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id "service/CagPlatform-production/CagPlatform-production-CagService"
```

### 4.3 Update the Application

To deploy a new version of the application:

```bash
# 1. Merge changes to the target branch (staging or master)
# 2. Trigger the deployment workflow
#    - Staging: Actions > Deploy durable environment > staging
#    - Production: Actions > Deploy durable environment > production

# Or deploy locally:
cd infra
npm exec cdk -- deploy \
  --context stage=staging \
  --outputs-file /tmp/cdk-outputs.json \
  --require-approval never
```

The `cdk deploy` command:
1. Builds a new Docker image with the new code
2. Uploads the image to the CDK bootstrap ECR repository
3. Creates a new task definition revision pointing to the new image
4. Updates the ECS service, triggering a rolling deployment
5. If the new task fails the health check, the circuit breaker automatically rolls back

### 4.4 View ECS Events

```bash
# View recent service events
aws ecs describe-services \
  --cluster CagPlatform-production \
  --services CagPlatform-production-CagService \
  --query 'services[0].events[0:10]' \
  --output table
```

### 4.5 Tear Down a Stack

```bash
# Preview stacks (safe to destroy when done)
npm exec cdk -- destroy \
  --context stage=preview \
  --context "previewId=dev-512" \
  --force

# Staging (only if you want to recreate)
npm exec cdk -- destroy \
  --context stage=staging \
  --force

# Production (WARNING: this is destructive)
# Production stack has termination protection enabled.
# You must disable it first:
aws cloudformation update-termination-protection \
  --stack-name CagPlatform-production \
  --enable-termination-protection false

# Then destroy
npm exec cdk -- destroy \
  --context stage=production \
  --force
```

**Important:** Destroying a stack removes all resources including the VPC, security groups, ECS tasks, and ALB. RETAIN'd CloudWatch logs (production) will remain but the stack itself is gone.

---

## Verification Commands Reference

### Health Endpoints

```bash
# Liveness (used by ECS container health check)
curl -s http://<alb-dns>/api/health/live | jq .
# Expected: { "status": "ok" }

# Readiness (used by ALB target group health check)
curl -s http://<alb-dns>/api/health/ready | jq .
# Expected: { "status": "ready" }
```

**Note:** For production deployments with HTTPS configured, use `https://` instead of `http://`. The ALB automatically redirects HTTP to HTTPS in production.

### Application Verification

```bash
# Smoke test (runs all checks)
BASE_URL="http://<alb-dns>" npm run smoke:server

# For production with HTTPS:
BASE_URL="https://<alb-dns>" npm run smoke:server

# Home page
curl -s -o /dev/null -w "%{http_code}\n" http://<alb-dns>/
# Expected: 200

# Static assets
curl -s -o /dev/null -w "%{http_code}\n" http://<alb-dns>/favicon-32x32.png
# Expected: 200

# Public images
curl -s -o /dev/null -w "%{http_code}\n" http://<alb-dns>/images/cagLogo1.svg
# Expected: 200
```

### Infrastructure Verification

```bash
# List stacks
npm exec cdk -- list
npm exec cdk -- list --context stage=staging
npm exec cdk -- list --context stage=production
npm exec cdk -- list --context stage=preview --context previewId=dev-512

# Diff a stack against deployed
npm exec cdk -- diff CagPlatform-staging --context stage=staging

# View stack outputs
aws cloudformation describe-stacks \
  --stack-name CagPlatform-staging \
  --query 'Stacks[0].Outputs'

# View all stack resources
aws cloudformation list-stack-resources \
  --stack-name CagPlatform-staging

# Export function for easy access
function stack-url() {
  local stack=$1
  aws cloudformation describe-stacks \
    --stack-name "$stack" \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerUrl`].OutputValue' \
    --output text
}
stack-url CagPlatform-staging
```

### Common Commands

```bash
# Synth (no AWS credentials needed)
cd infra && npm exec cdk -- synth --context stage=staging

# Deploy staging
cd infra && npm exec cdk -- deploy --context stage=staging --require-approval never

# Deploy preview
cd infra && npm exec cdk -- deploy \
  --context stage=preview --context previewId=dev-512 \
  --require-approval never

# Destroy preview
cd infra && npm exec cdk -- destroy \
  --context stage=preview --context previewId=dev-512 \
  --force

# Bootstrap
cd infra && npm exec cdk -- bootstrap --context stage=staging

# List all stacks
cd infra && npm exec cdk -- list
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Install deps | `cd infra && npm ci` |
| Run tests | `cd infra && npm test` |
| Test + synth | `cd infra && npm run verify` |
| Synth | `cd infra && npm exec cdk -- synth --context stage=staging` |
| Deploy staging | `cd infra && npm exec cdk -- deploy --context stage=staging --require-approval never` |
| Deploy preview | `cd infra && npm exec cdk -- deploy --context stage=preview --context previewId=dev-512 --require-approval never` |
| Deploy production | `cd infra && CERTIFICATE_ARN="..." WEB_ACL_ARN="..." FLOW_LOGS=true npm exec cdk -- deploy --context stage=production --require-approval never` |
| Destroy preview | `cd infra && npm exec cdk -- destroy --context stage=preview --context previewId=dev-512 --force` |
| Diff | `cd infra && npm exec cdk -- diff CagPlatform-staging --context stage=staging` |
| Bootstrap | `cd infra && npm exec cdk -- bootstrap --context stage=staging` |
| Smoke test (preview/staging) | `BASE_URL="http://<alb-dns>" npm run smoke:server` |
| Smoke test (production) | `BASE_URL="https://<alb-dns>" npm run smoke:server` |
| View logs | `aws logs tail "/cag/staging/frontend" --follow` |
| Check service | `aws ecs describe-services --cluster CagPlatform-staging --services CagPlatform-staging-CagService` |