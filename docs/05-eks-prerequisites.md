# 05 - EKS Prerequisites

The EKS cluster is intentionally outside this project.

## Cluster requirements

The existing EKS cluster should have:

- working worker nodes
- Kubernetes API reachable from GitHub-hosted runner
- ECR image pull capability for nodes
- a StorageClass for the PostgreSQL PVC
- AWS Load Balancer Controller if you later replace the Service type with an ALB/Ingress design

## Kubernetes access for GitHub Actions

The AWS role assumed by GitHub must have an EKS access entry or equivalent authentication mapping.

The Kubernetes permissions must allow the workflow to create/update:

- Namespace
- Deployment
- StatefulSet
- Service
- Secret
- ConfigMap
- PVC
- Pod test resources

A typical production approach is to create a dedicated EKS access entry for the GitHub deployment role and bind only the required Kubernetes RBAC permissions.

## Validate manually

From a machine already configured for the cluster:

```bash
aws eks describe-cluster --name <cluster>
aws eks update-kubeconfig --name <cluster> --region <region>
kubectl get nodes
kubectl get storageclass
```

## ECR image pull

The EKS worker/node role normally needs ECR read permissions. For EKS with managed node groups, verify the node IAM role can pull private ECR images.

## LoadBalancer

The frontend service is configured as:

```yaml
type: LoadBalancer
```

On EKS this normally creates an AWS load balancer through the cluster's cloud integration/controller.

Get the address with:

```bash
kubectl get svc -n three-tier
```

Then open the `EXTERNAL-IP`/hostname in a browser.
