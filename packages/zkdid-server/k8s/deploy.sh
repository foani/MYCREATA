#!/bin/bash

# 환경 변수 설정
export KUBE_NAMESPACE=crelink
export DOCKER_REGISTRY=crelink
export IMAGE_TAG=$(git rev-parse --short HEAD)

# 네임스페이스 생성
kubectl apply -f namespace.yaml

# Secret 생성
kubectl apply -f secrets.yaml

# ConfigMap 생성
kubectl apply -f configmap.yaml

# Deployment, Service, Ingress 생성
kubectl apply -f deployment.yaml

# 배포 상태 확인
kubectl rollout status deployment/zkdid-server -n $KUBE_NAMESPACE

# 로그 확인
kubectl logs -l app=zkdid-server -n $KUBE_NAMESPACE --tail=100

# 서비스 상태 확인
kubectl get svc -n $KUBE_NAMESPACE
kubectl get ingress -n $KUBE_NAMESPACE 