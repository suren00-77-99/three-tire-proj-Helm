# 04 - CD Pipeline

Workflow: `.github/workflows/cd-validate-deploy.yml`

Trigger:

```text
Actions -> CD - Validate Cluster and Deploy -> Run workflow
```

Enter the Git SHA that passed CI.

## Stage 1 - Validate cluster

The workflow calls:

```bash
aws eks describe-cluster
aws eks update-kubeconfig
kubectl get nodes
kubectl get storageclass
kubectl auth can-i ...
```

No EKS cluster is created by this workflow.

## Stage 2 - Frontend

Helm receives the frontend ECR image:

```bash
--set frontend.image.repository="$ECR_REGISTRY/three-tier-frontend"
--set frontend.image.tag="$IMAGE_TAG"
```

The workflow waits for:

```bash
kubectl rollout status deployment/three-tier-app-frontend
```

## Stage 3 - Backend

The backend image is set to the same approved SHA.

The backend uses the PostgreSQL service name:

```text
three-tier-app-postgres
```

## Stage 4 - Database

PostgreSQL is deployed as a StatefulSet with a PVC.

The database password comes from a GitHub Actions secret and is passed to Helm at runtime.

## Stage 5 - Final verification

Commands:

```bash
kubectl get deployment,statefulset,service,pod,pvc -n three-tier
helm status three-tier-app -n three-tier
helm test three-tier-app -n three-tier --logs
```

The final GitHub Actions summary contains:

- cluster name
- AWS region
- image tag
- object status
- Helm status
- successful deployment message

## Why the Helm install command appears in each stage

Helm is declarative. `helm upgrade --install` is idempotent. Each stage applies the same desired release configuration while the workflow gates the next stage on the previous workload becoming ready.

For a more advanced production implementation, split the chart into separate releases or use a single deploy job with explicit Helm hooks. This lab keeps the requested frontend/backend/database stages visible in GitHub Actions.
