#!/usr/bin/env bash
set -euo pipefail

fn="$1"
version="$2"
kind="$3"
out="$(mktemp)"

case "$kind" in
  wrapped) payload='{"headers":{}}' ;;
  pre-sign-up) payload='{"request":{"userAttributes":{"email":"smoke@example.invalid"}}}' ;;
  post-confirmation) payload='{"triggerSource":"PostConfirmation_ConfirmForgotPassword"}' ;;
  subscribe-guard) payload='{"identity":{"sub":"smoke"},"info":{"channel":{"segments":["hh","smoke"]}}}' ;;
  *) echo "unknown kind: $kind"; exit 2 ;;
esac

error=$(aws lambda invoke --function-name "$fn" --qualifier "$version" \
  --cli-binary-format raw-in-base64-out --payload "$payload" \
  --query FunctionError --output text "$out")

case "$kind" in
  wrapped) [ "$error" = None ] && jq -e '.statusCode == 403' "$out" > /dev/null ;;
  pre-sign-up) [ "$error" = Unhandled ] && jq -e '.errorMessage == "NO_INVITE"' "$out" > /dev/null ;;
  post-confirmation) [ "$error" = None ] ;;
  subscribe-guard) [ "$error" = None ] && jq -e '.error == "unauthorized"' "$out" > /dev/null ;;
esac || { echo "$fn v$version failed smoke ($kind): FunctionError=$error"; cat "$out"; exit 1; }

echo "$fn v$version ok"
