---
name: provisioning-infrastructure
description: Cloud-native infrastructure knowledge reference covering Kubernetes, Helm, Kustomize, Operators, CRDs, GitOps (ArgoCD, Flux), and IaC (Terraform, Pulumi, CDK). Use when provisioning infrastructure, managing clusters, or working with GitOps workflows.
user-invocable: false
---

# 云原生基础设施 · Infrastructure

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/backend/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

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
