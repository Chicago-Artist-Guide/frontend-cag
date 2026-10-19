#!/usr/bin/env bash
# Move the July IAM stack without deleting its account-global roles or policy.
set -euo pipefail
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
[[ "$AWS_REGION" == us-east-1 ]] || { echo 'Canary IAM must move to us-east-1' >&2; exit 1; }
[[ "$(aws sts get-caller-identity --query Account --output text)" == "$AWS_ACCOUNT_ID" ]] || { echo 'AWS account mismatch' >&2; exit 1; }
export AWS_PAGER=''
STACK_NAME=CagGithubCanaryDelivery
OLD_REGION=us-east-2
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.."
TEMP_DIRECTORY="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIRECTORY"' EXIT

# Only the precise missing-stack response permits creation or import. An IAM or
# network failure must never masquerade as an absent stack.
stack_status() {
  local region="$1" status
  if status="$(aws cloudformation describe-stacks --region "$region" --stack-name "$STACK_NAME" --query 'Stacks[0].StackStatus' --output text 2>"$TEMP_DIRECTORY/error")"; then
    [[ -n "$status" && "$status" != None ]] || { echo 'Missing stack status in successful response' >&2; exit 1; }
    echo "$status"
  elif grep -Fq '(ValidationError)' "$TEMP_DIRECTORY/error" && grep -Fq "Stack with id $STACK_NAME does not exist" "$TEMP_DIRECTORY/error"; then
    echo MISSING
  else
    cat "$TEMP_DIRECTORY/error" >&2
    exit 1
  fi
}

TARGET_STATUS="$(stack_status "$AWS_REGION")"
case "$TARGET_STATUS" in
  IMPORT_IN_PROGRESS)
    aws cloudformation wait stack-import-complete --region "$AWS_REGION" --stack-name "$STACK_NAME"
    TARGET_STATUS="$(stack_status "$AWS_REGION")"
    ;;
  UPDATE_IN_PROGRESS|UPDATE_COMPLETE_CLEANUP_IN_PROGRESS)
    aws cloudformation wait stack-update-complete --region "$AWS_REGION" --stack-name "$STACK_NAME"
    TARGET_STATUS="$(stack_status "$AWS_REGION")"
    ;;
esac
SOURCE_STATUS="$(stack_status "$OLD_REGION")"
case "$TARGET_STATUS" in
  CREATE_COMPLETE|IMPORT_COMPLETE|UPDATE_COMPLETE)
    [[ "$SOURCE_STATUS" == MISSING ]] || { echo 'Both regions still own a canary IAM stack; refusing migration' >&2; exit 1; }
    aws cloudformation list-stack-resources --region "$AWS_REGION" --stack-name "$STACK_NAME" --output json >"$TEMP_DIRECTORY/resources.json"
    node --import tsx "$DIR/canary-iam-migration.ts" target "$TEMP_DIRECTORY/resources.json" "$AWS_ACCOUNT_ID"
    echo "Canary IAM already migrated to $AWS_REGION"
    exit 0
    ;;
  MISSING|REVIEW_IN_PROGRESS) ;;
  *) echo "Cannot safely import into target stack in $TARGET_STATUS; retained IAM resources require inspection" >&2; exit 1 ;;
esac

case "$SOURCE_STATUS" in
  UPDATE_IN_PROGRESS|UPDATE_COMPLETE_CLEANUP_IN_PROGRESS)
    aws cloudformation wait stack-update-complete --region "$OLD_REGION" --stack-name "$STACK_NAME"
    SOURCE_STATUS="$(stack_status "$OLD_REGION")"
    ;;
  DELETE_IN_PROGRESS)
    aws cloudformation wait stack-delete-complete --region "$OLD_REGION" --stack-name "$STACK_NAME"
    SOURCE_STATUS="$(stack_status "$OLD_REGION")"
    ;;
esac
case "$SOURCE_STATUS" in
  CREATE_COMPLETE|UPDATE_COMPLETE)
    aws cloudformation describe-stacks --region "$OLD_REGION" --stack-name "$STACK_NAME" --query 'Stacks[0].Parameters' --output json >"$TEMP_DIRECTORY/parameters.json"
    node --import tsx "$DIR/canary-iam-migration.ts" parameters "$TEMP_DIRECTORY/parameters.json" "$DIR/canary-iam.yaml"
    aws cloudformation get-template --region "$OLD_REGION" --stack-name "$STACK_NAME" --output json >"$TEMP_DIRECTORY/source.json"
    node --import tsx "$DIR/canary-iam-migration.ts" compare "$TEMP_DIRECTORY/source.json" "$DIR/canary-iam.yaml"
    node --import tsx "$DIR/canary-iam-migration.ts" guard "$DIR/canary-iam.yaml"
    aws cloudformation deploy --region "$OLD_REGION" --stack-name "$STACK_NAME" \
      --template-file "$DIR/canary-iam.yaml" --parameter-overrides "WorkloadRegion=$AWS_REGION" \
      --capabilities CAPABILITY_NAMED_IAM --no-fail-on-empty-changeset
    aws cloudformation get-template --region "$OLD_REGION" --stack-name "$STACK_NAME" --output json >"$TEMP_DIRECTORY/retained.json"
    node --import tsx "$DIR/canary-iam-migration.ts" compare "$TEMP_DIRECTORY/retained.json" "$DIR/canary-iam.yaml"
    node --import tsx "$DIR/canary-iam-migration.ts" guard "$TEMP_DIRECTORY/retained.json"
    aws cloudformation delete-stack --region "$OLD_REGION" --stack-name "$STACK_NAME"
    aws cloudformation wait stack-delete-complete --region "$OLD_REGION" --stack-name "$STACK_NAME"
    ;;
  MISSING) ;;
  *) echo "Cannot safely migrate source stack in $SOURCE_STATUS; no IAM resources were deleted" >&2; exit 1 ;;
esac

node --import tsx "$DIR/canary-iam-migration.ts" import "$DIR/canary-iam.yaml" >"$TEMP_DIRECTORY/import.json"
CHANGE_SET_NAME="import-from-us-east-2-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-$(date +%s)-$$"
aws cloudformation create-change-set --region "$AWS_REGION" --stack-name "$STACK_NAME" \
  --change-set-name "$CHANGE_SET_NAME" --change-set-type IMPORT \
  --template-body "file://$TEMP_DIRECTORY/import.json" \
  --parameters "ParameterKey=WorkloadRegion,ParameterValue=$AWS_REGION" \
  --capabilities CAPABILITY_NAMED_IAM --resources-to-import "[
  {\"ResourceType\":\"AWS::IAM::ManagedPolicy\",\"LogicalResourceId\":\"CanaryCloudFormationExecutionPolicy\",\"ResourceIdentifier\":{\"PolicyArn\":\"arn:aws:iam::$AWS_ACCOUNT_ID:policy/CagCanaryCloudFormationExecution\"}},
  {\"ResourceType\":\"AWS::IAM::Role\",\"LogicalResourceId\":\"CanaryPlanRole\",\"ResourceIdentifier\":{\"RoleName\":\"CagGithubCanaryPlanRole\"}},
  {\"ResourceType\":\"AWS::IAM::Role\",\"LogicalResourceId\":\"CanaryDeployRole\",\"ResourceIdentifier\":{\"RoleName\":\"CagGithubCanaryDeployRole\"}},
  {\"ResourceType\":\"AWS::IAM::Role\",\"LogicalResourceId\":\"CanaryDestroyRole\",\"ResourceIdentifier\":{\"RoleName\":\"CagGithubCanaryDestroyRole\"}}]"
aws cloudformation wait change-set-create-complete --region "$AWS_REGION" --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
aws cloudformation execute-change-set --region "$AWS_REGION" --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
aws cloudformation wait stack-import-complete --region "$AWS_REGION" --stack-name "$STACK_NAME"
aws cloudformation list-stack-resources --region "$AWS_REGION" --stack-name "$STACK_NAME" --output json >"$TEMP_DIRECTORY/resources.json"
node --import tsx "$DIR/canary-iam-migration.ts" target "$TEMP_DIRECTORY/resources.json" "$AWS_ACCOUNT_ID"
echo "Canary IAM imported into $AWS_REGION; deploy canary-iam.yaml to restore Outputs"
