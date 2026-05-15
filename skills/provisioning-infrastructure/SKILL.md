---
name: provisioning-infrastructure
description: 云原生基础设施。Kubernetes、Helm、Kustomize、Operator、CRD、GitOps、ArgoCD、Flux、IaC、Terraform、Pulumi、CDK。当用户提到 K8s、Helm、GitOps、IaC 时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 云原生基础设施 · Infrastructure

```
GitOps控制平面(ArgoCD/Flux) → Kubernetes(Helm/Kustomize) → IaC(Terraform/Pulumi/CDK)
```

## K8s 检查项

livenessProbe+readinessProbe | requests+limits | HPA | PDB | ResourceQuota | 镜像 Digest | Pod 反亲和 | External Secrets

## GitOps 检查项

automated prune+selfHeal | ApplicationSet 多环境 | 密钥加密(Sealed Secrets/ESO) | 镜像自动更新

## IaC 检查项

模块化复用 | 环境隔离不同 State | 远程状态+锁定 | Provider 版本锁 | Secrets Manager | 统一标签 | Plan 审查再 Apply

Helm/Kustomize/Operator、GitOps 工具对比、IaC 工具详情详见 [references/details.md](references/details.md)

## 触发词

Kubernetes、K8s、Helm、Kustomize、Operator、CRD、GitOps、ArgoCD、Flux、IaC、Terraform、Pulumi、CDK
