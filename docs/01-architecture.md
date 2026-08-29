# 01 - Architecture

## Goal

Build and deploy a complete three-tier application:

1. Frontend - NGINX static application
2. Backend - Node.js HTTP API
3. Database - PostgreSQL

The application is packaged as containers and deployed by Helm to an existing EKS cluster.

## Pipeline separation

### Pipeline 1 - CI

```text
Git push
  |
  v
Checkout
  |
  v
Helm lint + Helm template + helm-unittest
  |
  v
Docker build
  |
  v
Trivy filesystem + image scan
  |
  +---- fail --> STOP
  |
  v
Push approved image to ECR
```

The CI pipeline never calls kubectl and never deploys to Kubernetes.

### Pipeline 2 - CD

```text
Manual GitHub Actions dispatch
  |
  v
AWS OIDC
  |
  v
Validate existing EKS cluster
  |
  v
Frontend stage
  |
  v
Backend stage
  |
  v
Database stage
  |
  v
kubectl + Helm verification
  |
  v
GitHub Actions Summary
```

## Why OIDC?

GitHub Actions receives a short-lived OIDC token and exchanges it with AWS STS for temporary credentials. Long-lived AWS access keys do not need to be stored in GitHub.

## Why Helm?

Helm gives one versioned release containing:

- Deployments
- Services
- StatefulSet
- PVC
- Secret
- ConfigMap
- Helm test

Image tags are supplied at deployment time, so the same chart can deploy different CI-approved versions.

## Why ECR?

ECR is the AWS private registry. Images are only pushed after the Trivy gate passes.
