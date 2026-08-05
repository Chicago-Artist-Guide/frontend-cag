#!/usr/bin/env bash
# Read-only evidence capture for canary deployments.
#
# The ECS deployment circuit breaker rolls the stack back on failure, which
# deletes the cluster, the stopped-task records, and the application log
# group. "watch" polls those resources with the read-only CDK lookup role
# while cdk deploy runs, keeping the last useful snapshot of each on disk;
# "report" prints whatever was captured after a failure.
set -uo pipefail

MODE="${1:?usage: canary-diagnostics.sh watch|report <output-directory>}"
OUTPUT_DIRECTORY="${2:?usage: canary-diagnostics.sh watch|report <output-directory>}"

if [ "$MODE" = "report" ]; then
  echo "## Canary deployment diagnostics"
  FOUND_SNAPSHOTS=0
  for SNAPSHOT in "$OUTPUT_DIRECTORY"/*.log; do
    [ -f "$SNAPSHOT" ] || continue
    FOUND_SNAPSHOTS=1
    echo
    echo "--- ${SNAPSHOT##*/} ---"
    cat "$SNAPSHOT"
  done
  if [ "$FOUND_SNAPSHOTS" = 0 ]; then
    echo "No diagnostics were captured before the resources were rolled back."
  fi
  exit 0
fi

if [ "$MODE" != "watch" ]; then
  echo "Unknown mode: $MODE" >&2
  exit 1
fi

: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"

mkdir -p "$OUTPUT_DIRECTORY"

LOOKUP_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/cdk-cagcanary-lookup-role-${AWS_ACCOUNT_ID}-${AWS_REGION}"
CREDENTIALS_JSON="$(
  aws sts assume-role \
    --role-arn "$LOOKUP_ROLE_ARN" \
    --role-session-name cag-canary-diagnostics \
    --query Credentials \
    --output json
)" || {
  echo "Could not assume the lookup role for diagnostics." >&2
  exit 1
}
AWS_ACCESS_KEY_ID="$(jq -r .AccessKeyId <<<"$CREDENTIALS_JSON")"
AWS_SECRET_ACCESS_KEY="$(jq -r .SecretAccessKey <<<"$CREDENTIALS_JSON")"
AWS_SESSION_TOKEN="$(jq -r .SessionToken <<<"$CREDENTIALS_JSON")"
export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN

WATCH_START_MS=$(( $(date +%s) * 1000 ))

# Replace a snapshot only when the new capture succeeded and has content, so
# a rollback that empties the source cannot wipe evidence already captured.
capture() {
  local SNAPSHOT="$1"
  shift
  local STAGED="${SNAPSHOT}.tmp"
  if "$@" >"$STAGED" 2>/dev/null && [ -s "$STAGED" ] \
    && ! grep -qxE '\[\]|null|None' "$STAGED"; then
    mv "$STAGED" "$SNAPSHOT"
  else
    rm -f "$STAGED"
  fi
}

for _ in $(seq 1 120); do
  CLUSTER_ARN="$(
    aws ecs list-clusters \
      --query "clusterArns[?contains(@, 'CagPlatform-canary')] | [0]" \
      --output text 2>/dev/null
  )"
  if [ -n "$CLUSTER_ARN" ] && [ "$CLUSTER_ARN" != "None" ]; then
    SERVICE_ARN="$(
      aws ecs list-services --cluster "$CLUSTER_ARN" \
        --query 'serviceArns[0]' --output text 2>/dev/null
    )"
    if [ -n "$SERVICE_ARN" ] && [ "$SERVICE_ARN" != "None" ]; then
      capture "$OUTPUT_DIRECTORY/service-events.log" \
        aws ecs describe-services --cluster "$CLUSTER_ARN" \
        --services "$SERVICE_ARN" \
        --query 'services[0].events[0:20]' --output json
    fi
    STOPPED_TASK_ARNS="$(
      aws ecs list-tasks --cluster "$CLUSTER_ARN" --desired-status STOPPED \
        --query 'taskArns' --output json 2>/dev/null
    )"
    if [ -n "$STOPPED_TASK_ARNS" ] \
      && [ "$(jq length <<<"$STOPPED_TASK_ARNS")" -gt 0 ]; then
      # shellcheck disable=SC2046
      capture "$OUTPUT_DIRECTORY/stopped-tasks.log" \
        aws ecs describe-tasks --cluster "$CLUSTER_ARN" \
        --tasks $(jq -r '.[]' <<<"$STOPPED_TASK_ARNS") \
        --query 'tasks[].{taskArn: taskArn, stopCode: stopCode, stoppedReason: stoppedReason, containers: containers[].{name: name, exitCode: exitCode, reason: reason, healthStatus: healthStatus}}' \
        --output json
    fi
  fi
  capture "$OUTPUT_DIRECTORY/container-logs.log" \
    aws logs filter-log-events --log-group-name /cag/canary/frontend \
    --start-time "$WATCH_START_MS" \
    --query 'events[].message' --output text
  sleep 15
done
