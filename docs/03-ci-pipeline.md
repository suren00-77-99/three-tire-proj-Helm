# 03 - CI Pipeline

Workflow: `.github/workflows/ci-build-scan-push.yml`

## Stage 1 - Checkout

The workflow checks out the Git repository.

```yaml
- uses: actions/checkout@v5
```

## Stage 2 - Helm lint

```bash
helm lint helm/three-tier-app
```

This catches chart syntax and common chart issues before any image is built.

## Stage 3 - Helm render

```bash
helm template ...
```

This proves the chart can render Kubernetes YAML without contacting a cluster.

## Stage 4 - Helm unit tests

The workflow installs `helm-unittest` and runs:

```bash
helm unittest helm/three-tier-app
```

These tests run locally and do not create Kubernetes resources.

## Stage 5 - Docker build

The matrix builds:

```text
three-tier-frontend:<git-sha>
three-tier-backend:<git-sha>
```

The Git commit SHA is used as the immutable application version.

## Stage 6 - Trivy

Two scans are used:

1. Filesystem scan
2. Container image scan

The gate is:

```text
HIGH + CRITICAL
AND
fix available
```

If the scan exits non-zero, the workflow stops and nothing is pushed.

## Stage 7 - ECR push

Only an approved image reaches ECR.

Example:

```text
123456789012.dkr.ecr.ap-south-1.amazonaws.com/three-tier-frontend:<SHA>
123456789012.dkr.ecr.ap-south-1.amazonaws.com/three-tier-backend:<SHA>
```

## Important security point

Do not say "the image is permanently vulnerability-free." Vulnerability databases change. The correct statement is:

> The CI pipeline blocks images containing HIGH/CRITICAL vulnerabilities with available fixes according to the current Trivy database.

## Pull request behavior

On pull requests, the workflow runs the Helm quality gates. The build/push job is restricted to push events so pull requests do not publish images to ECR.
