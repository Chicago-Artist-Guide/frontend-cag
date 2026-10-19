#!/usr/bin/env bash
set -euo pipefail

: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
ACTUAL_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
test "$ACTUAL_ACCOUNT_ID" = "$AWS_ACCOUNT_ID"
SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IAM_STACK_REGION="${CAG_IAM_STACK_REGION:-us-east-1}"

aws cloudformation deploy \
  --region "$IAM_STACK_REGION" \
  --stack-name CagGithubProductionDelivery \
  --template-file "$SCRIPT_DIRECTORY/production-iam.yaml" \
  --parameter-overrides "WorkloadRegion=$AWS_REGION" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

EXECUTION_POLICY_ARN="$(aws cloudformation describe-stacks \
  --region "$IAM_STACK_REGION" \
  --stack-name CagGithubProductionDelivery \
  --query "Stacks[0].Outputs[?OutputKey=='ProductionExecutionPolicyArn'].OutputValue" \
  --output text)"

DNS_EXECUTION_POLICY_ARN="$(aws cloudformation describe-stacks \
  --region "$IAM_STACK_REGION" \
  --stack-name CagGithubProductionDelivery \
  --query "Stacks[0].Outputs[?OutputKey=='ProductionDnsExecutionPolicyArn'].OutputValue" \
  --output text)"

cd "$SCRIPT_DIRECTORY/.."
BOOTSTRAP_TEMPLATE="$(mktemp)"
trap 'rm -f "$BOOTSTRAP_TEMPLATE"' EXIT
npm exec tsx -- bootstrap/scope-bootstrap.ts "$BOOTSTRAP_TEMPLATE"

npm exec cdk -- bootstrap "aws://${AWS_ACCOUNT_ID}/${AWS_REGION}" \
  --template "$BOOTSTRAP_TEMPLATE" \
  --toolkit-stack-name CDKToolkit-cagprod \
  --qualifier cagprod \
  --bootstrap-kms-key-id AWS_MANAGED_KEY \
  --cloudformation-execution-policies "$EXECUTION_POLICY_ARN" \
  --cloudformation-execution-policies "$DNS_EXECUTION_POLICY_ARN" \
  --trust "$AWS_ACCOUNT_ID" \
  --trust-for-lookup "$AWS_ACCOUNT_ID"

aws cloudformation describe-stacks \
  --region "$IAM_STACK_REGION" \
  --stack-name CagGithubProductionDelivery \
  --query 'Stacks[0].Outputs'


CERTIFICATE_ARN="$(aws acm list-certificates \
  --certificate-statuses ISSUED PENDING_VALIDATION \
  --query "CertificateSummaryList[?DomainName=='www.chicagoartistguide.org'].CertificateArn | [0]" \
  --output text)"
if [[ "$CERTIFICATE_ARN" == "None" || -z "$CERTIFICATE_ARN" ]]; then
  CERTIFICATE_ARN="$(aws acm request-certificate \
    --domain-name www.chicagoartistguide.org \
    --validation-method DNS \
    --idempotency-token CagProductionWww \
    --tags Key=Application,Value=chicago-artist-guide Key=Environment,Value=production \
    --query CertificateArn --output text)"
fi

echo "Production certificate: $CERTIFICATE_ARN"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "certificate_arn=$CERTIFICATE_ARN" >> "$GITHUB_OUTPUT"
fi
for attempt in {1..12}; do
  VALIDATION_RECORD="$(aws acm describe-certificate \
    --certificate-arn "$CERTIFICATE_ARN" \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output json)"
  if [[ "$VALIDATION_RECORD" != "null" ]]; then
    echo "$VALIDATION_RECORD"
    if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
      {
        echo "## Production certificate"
        echo "$CERTIFICATE_ARN"
        echo 'Add this validation CNAME; leave the traffic CNAME on Amplify until HTTPS verification passes.'
        echo '```json'
        echo "$VALIDATION_RECORD"
        echo '```'
      } >> "$GITHUB_STEP_SUMMARY"
    fi
    break
  fi
  if [[ "$attempt" == 12 ]]; then
    echo "Certificate validation record is not available yet; inspect ACM before enabling HTTPS." >&2
  else
    sleep 5
  fi
done
