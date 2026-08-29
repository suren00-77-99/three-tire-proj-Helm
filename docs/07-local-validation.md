# 07 - Local Validation

## Prerequisites

Install:

- Docker
- Helm 3
- kubectl
- Trivy
- Node.js (optional for local backend testing)

## Helm

```bash
helm lint helm/three-tier-app

helm template three-tier-app helm/three-tier-app \
  --set frontend.image.repository=test/frontend \
  --set frontend.image.tag=test \
  --set backend.image.repository=test/backend \
  --set backend.image.tag=test \
  --set database.password=lab-password
```

Install the unit test plugin:

```bash
helm plugin install https://github.com/helm-unittest/helm-unittest.git --version 1.0.3
helm unittest helm/three-tier-app
```

## Build frontend

```bash
docker build -t three-tier-frontend:local ./app/frontend
trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 three-tier-frontend:local
```

## Build backend

```bash
docker build -t three-tier-backend:local ./app/backend
trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 three-tier-backend:local
```

## Local Kubernetes

You can use an existing local cluster such as Minikube or Kind for a lab.

```bash
helm upgrade --install three-tier-app helm/three-tier-app \
  --namespace three-tier --create-namespace \
  --set frontend.image.repository=three-tier-frontend \
  --set frontend.image.tag=local \
  --set backend.image.repository=three-tier-backend \
  --set backend.image.tag=local \
  --set database.password=lab-password
```

Then:

```bash
kubectl get all -n three-tier
kubectl get pvc -n three-tier
helm test three-tier-app -n three-tier --logs
```
