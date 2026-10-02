#!/usr/bin/env bash
# .jenkins/validate-env.sh
#
# Pre-flight check — verifies that all required environment variables
# are set before the pipeline attempts a deploy.
# Called in the Jenkins Deploy stage or manually before docker compose up.
#
# Usage: bash .jenkins/validate-env.sh

set -euo pipefail

REQUIRED_VARS=(
  "TELEGRAM_BOT_TOKEN"
  "APP_SECRET"
  "FRONTEND_URL"
  "VITE_BACKEND_URL"
)

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    MISSING+=("$var")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "❌ ERROR: The following required environment variables are not set:"
  for v in "${MISSING[@]}"; do
    echo "   - $v"
  done
  echo ""
  echo "Set them in Jenkins credentials (Manage Jenkins → Credentials)"
  echo "or export them in your shell before running docker compose."
  exit 1
fi

echo "✔ All required environment variables are present."
