#!/usr/bin/env bash
set -euo pipefail

EXPECTED_ACCOUNT_ID="095377239347"
AWS_REGION="${CAG_AWS_REGION:-us-east-1}"
STACK_NAME="CagGithubCanaryDelivery"
QUALIFIER="cagcanary"

ACTUAL_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
if [[ "$ACTUAL_ACCOUNT_ID" != "$EXPECTED_ACCOUNT_ID" ]]; then
  echo "Expected AWS account $EXPECTED_ACCOUNT_ID, got $ACTUAL_ACCOUNT_ID" >&2
  exit 1
fi

SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

aws cloudformation validate-template \
  --region "$AWS_REGION" \
  --template-body "file://$SCRIPT_DIRECTORY/canary-iam.yaml" \
  >/dev/null

aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --template-file "$SCRIPT_DIRECTORY/canary-iam.yaml" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

EXECUTION_POLICY_ARN="$(
  aws cloudformation describe-stacks \
    --region "$AWS_REGION" \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='CanaryExecutionPolicyArn'].OutputValue" \
    --output text
)"

npx --yes aws-cdk@2.1131.0 bootstrap \
  "aws://${ACTUAL_ACCOUNT_ID}/${AWS_REGION}" \
  --qualifier "$QUALIFIER" \
  --cloudformation-execution-policies "$EXECUTION_POLICY_ARN" \
  --trust "$ACTUAL_ACCOUNT_ID" \
  --trust-for-lookup "$ACTUAL_ACCOUNT_ID"

aws cloudformation describe-stacks \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --output table
