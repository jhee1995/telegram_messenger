#!/usr/bin/env bash
# .jenkins/cleanup.sh
#
# Removes stopped containers, dangling images, and unused volumes
# to keep the Jenkins agent disk from filling up between builds.
#
# Usage: bash .jenkins/cleanup.sh

set -euo pipefail

echo "🧹 Pruning stopped containers..."
docker container prune -f

echo "🧹 Pruning dangling images..."
docker image prune -f

echo "🧹 Pruning unused volumes (non-named only)..."
docker volume prune -f

echo "✔ Docker cleanup complete."
