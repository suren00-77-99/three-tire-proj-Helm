# Helm + EKS + GitHub Actions OIDC DevOps Lab

A complete three-tier demo application (frontend + backend + PostgreSQL) with:

- Dockerfiles for frontend and backend
- Amazon ECR image publishing
- Trivy image vulnerability scanning before push
- Helm chart with linting, offline unit tests, and runtime `helm test`
- GitHub Actions AWS OIDC (no long-lived AWS access keys)
- A separate deployment workflow that validates an already-created EKS cluster
- Deployment of frontend, backend, and database as explicit stages
- GitHub Actions job summary showing cluster name, workload status, and deployment result

## Important scope

**CI workflow does not touch Kubernetes.** It only checks out code, tests Helm, builds images, scans images, and pushes approved images to ECR.

**CD workflow does touch Kubernetes** because it is the deployment workflow. It assumes the EKS cluster already exists and uses OIDC to authenticate to AWS, then `aws eks update-kubeconfig` to access that cluster.

This project does **not** create the EKS cluster. The cluster is created manually (or by your normal infrastructure process), and the CD workflow validates it before Helm deployment.

## Architecture

Browser -> Frontend Service -> Backend Service -> PostgreSQL Service
                         |
                         +---- Kubernetes Secret / ConfigMap
                         |
                         +---- PVC for PostgreSQL

GitHub Actions -> AWS OIDC -> IAM Role -> ECR
GitHub Actions -> AWS OIDC -> IAM Role -> EKS API

## Repository layout

```text
.
├── .github/workflows/
│   ├── ci-build-scan-push.yml
│   └── cd-validate-deploy.yml
├── app/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── src/index.html
│   └── backend/
│       ├── Dockerfile
│       ├── package.json
│       └── src/server.js
├── helm/three-tier-app/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── templates/
│   └── tests/
├── docs/
│   ├── 01-architecture.md
│   ├── 02-oidc-and-iam.md
│   ├── 03-ci-pipeline.md
│   ├── 04-cd-pipeline.md
│   ├── 05-eks-prerequisites.md
│   ├── 06-github-configuration.md
│   ├── 07-local-validation.md
│   └── 08-troubleshooting.md
├── scripts/
│   ├── validate-local.sh
│   └── package-images.sh
├── .trivyignore
└── .gitignore
```

## Required GitHub configuration

Repository variables:

- `AWS_REGION` = e.g. `ap-south-1`
- `AWS_ACCOUNT_ID` = your 12-digit AWS account ID
- `EKS_CLUSTER_NAME` = manually created EKS cluster
- `AWS_GITHUB_ROLE_ARN` = IAM role ARN trusted by GitHub OIDC
- `ECR_REGISTRY` = `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com`

The workflow creates ECR repositories if they do not exist.

Do not store `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in GitHub.

## First run

1. Create the GitHub OIDC provider and IAM role using `docs/02-oidc-and-iam.md`.
2. Create the EKS cluster manually and make sure the IAM role can describe the cluster and access Kubernetes.
3. Add the GitHub variables.
4. Push the repository.
5. Run **CI - Helm Build Scan Push**.
6. After CI succeeds, run **CD - Validate Cluster and Deploy** manually.
7. Select the ECR image tag from the CI run (the default is the commit SHA).
8. Review the GitHub Actions summary.

## Security note about "vulnerability-free"

No public base image can honestly be guaranteed to have zero vulnerabilities forever. This lab uses Trivy as a release gate and fails on **HIGH/CRITICAL vulnerabilities with available fixes**, while ignoring unfixed findings. This is a practical CI policy, not a guarantee of zero CVEs.

For stricter production policy, change the Trivy settings to fail on all severities and/or maintain an approved vulnerability exception process.

## Runtime checks

After deployment, the CD workflow performs:

```bash
kubectl get nodes
kubectl get all -n three-tier
kubectl get pvc -n three-tier
helm status three-tier-app -n three-tier
helm test three-tier-app -n three-tier
```

It also waits for frontend, backend, and database workloads to become ready and writes the result to `$GITHUB_STEP_SUMMARY`.
