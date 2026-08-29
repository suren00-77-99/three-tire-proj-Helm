#!/usr/bin/env bash
set -euo pipefail

echo "== Helm lint =="
helm lint helm/three-tier-app

echo "== Helm render =="
helm template three-tier-app helm/three-tier-app \
  --set frontend.image.repository=test/frontend \
  --set frontend.image.tag=test \
  --set backend.image.repository=test/backend \
  --set backend.image.tag=test \
  --set database.password=lab-password >/tmp/three-tier-rendered.yaml

echo "== Helm unit tests =="
helm unittest helm/three-tier-app

echo "Local validation passed."
