#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${1:?Usage: ./scripts/package-images.sh <ECR_REGISTRY> <TAG>}"
TAG="${2:?Usage: ./scripts/package-images.sh <ECR_REGISTRY> <TAG>}"

docker build -t "$REGISTRY/three-tier-frontend:$TAG" ./app/frontend
docker build -t "$REGISTRY/three-tier-backend:$TAG" ./app/backend

echo "Built:"
echo "$REGISTRY/three-tier-frontend:$TAG"
echo "$REGISTRY/three-tier-backend:$TAG"
