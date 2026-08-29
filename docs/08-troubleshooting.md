# 08 - Troubleshooting

## Helm lint fails

Run:

```bash
helm lint helm/three-tier-app
helm template three-tier-app helm/three-tier-app --debug
```

Check indentation and values.

## Trivy fails

Run locally:

```bash
trivy image --severity HIGH,CRITICAL --ignore-unfixed <image>
```

Do not blindly add a CVE to `.trivyignore`. First confirm the vulnerability, exploitability, fix availability and business impact.

## ECR push fails

Check:

```bash
aws sts get-caller-identity
aws ecr describe-repositories
```

Confirm the GitHub role has ECR write permissions.

## EKS validation fails

Check:

```bash
aws eks describe-cluster --name <cluster> --region <region>
aws eks update-kubeconfig --name <cluster> --region <region>
kubectl get nodes
```

Then verify the GitHub role has EKS access and Kubernetes RBAC.

## ImagePullBackOff

Run:

```bash
kubectl describe pod <pod> -n three-tier
```

Common causes:

- wrong ECR registry
- wrong image tag
- EKS node role lacks ECR read
- image was never pushed because Trivy failed

## PVC Pending

Run:

```bash
kubectl get storageclass
kubectl describe pvc <pvc> -n three-tier
```

The cluster must have a usable StorageClass and CSI provisioner.

## Frontend LoadBalancer Pending

Run:

```bash
kubectl get svc -n three-tier
kubectl describe svc three-tier-app-frontend -n three-tier
```

Check the EKS load-balancing integration and subnet/network configuration.

## Backend returns 503

Run:

```bash
kubectl logs deployment/three-tier-app-backend -n three-tier
kubectl get pods -n three-tier
kubectl get svc -n three-tier
```

Check PostgreSQL readiness and the DB secret.

## Helm test fails

Run:

```bash
helm test three-tier-app -n three-tier --logs
kubectl get pods -n three-tier
```

The test pod calls the backend and frontend services.
