# Kubernetes Deployment

## Prerequisites
- Image with API runtime published to your registry (example: `bizmedia/amb-api:latest`).
- Kubernetes secret `amb-api-secrets` with keys:
  - `DATABASE_URL`
  - `JWT_SECRET`

## Apply migration before rollout
```bash
kubectl apply -f deploy/k8s/api-migrate-job.yaml
kubectl wait --for=condition=complete --timeout=120s job/amb-api-migrate
```

## Deploy API
```bash
kubectl apply -f deploy/k8s/api-deployment.yaml
kubectl apply -f deploy/k8s/api-service.yaml
```
