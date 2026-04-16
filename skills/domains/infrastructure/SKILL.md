---
name: infrastructure
description: 云原生基础设施。Kubernetes、Helm、Kustomize、Operator、CRD、GitOps、ArgoCD、Flux、IaC、Terraform、Pulumi、CDK。当用户提到 K8s、Helm、GitOps、IaC 时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 云原生基础设施 · Infrastructure

```
GitOps控制平面 → ArgoCD/Flux | Kubernetes(Helm/Kustomize) | IaC(Terraform/Pulumi)
```

---

## Kubernetes

### Helm Chart

结构：`Chart.yaml` + `values.yaml` + `templates/` + `charts/`
- Chart.yaml：`apiVersion: v2`, dependencies(condition控制启用)
- values.yaml：image/replicaCount/resources/autoscaling/service/ingress/probes/env/persistence
- `_helpers.tpl`：fullname/labels/selectorLabels
- 配置校验：`checksum/config: {{ include | sha256sum }}` 触发滚动更新
- 安全：`runAsNonRoot: true, runAsUser: 1000`
- 命令：`helm lint` / `template --debug` / `install -f values-prod.yaml` / `upgrade --reuse-values` / `rollback` / `push oci://`

### Kustomize

`base/` + `overlays/{dev,staging,production}/`
base：resources/commonLabels/images/configMapGenerator/secretGenerator
overlay：namespace/patchesStrategicMerge/patchesJson6902/replicas/images
命令：`kubectl apply -k overlays/production` / `kubectl diff -k`

### Operator

CRD：openAPIV3Schema(spec/status) + subresources(status/scale)
Controller：Get CR → 构建期望态 → Create/Update子资源 → 更新Status + OwnerReferences级联删除
初始化：`operator-sdk init` → `create api` → `make manifests` → `make install`

### 部署策略

| 策略 | 实现 | 场景 |
|------|------|------|
| 滚动更新 | `rollingUpdate` maxSurge/maxUnavailable | 默认 |
| 蓝绿 | 双Deployment + Service selector切换 | 零停机 |
| 金丝雀 | stable(9)+canary(1)共享Service | 渐进验证 |
| Flagger | `Canary` CRD + 自动分析指标 | 自动化金丝雀 |

### K8s Checklist

livenessProbe+readinessProbe | requests+limits | HPA自动扩缩 | PDB防中断 | ResourceQuota+LimitRange | 镜像Digest | Pod反亲和 | External Secrets

---

## GitOps

### ArgoCD vs Flux

| 特性 | ArgoCD | Flux |
|------|--------|------|
| Web UI | 强大 | 无(Weave GitOps) |
| 多租户 | Projects+RBAC | 需额外配置 |
| 多集群 | 原生 | 原生 |
| 镜像自动更新 | 需Image Updater | 原生 |
| 渐进式交付 | Argo Rollouts | Flagger |

### ArgoCD

- Application：source(repoURL/path/targetRevision) + destination(server/namespace)
- syncPolicy：`automated(prune:true, selfHeal:true)` + retry
- ignoreDifferences：忽略HPA修改的 `/spec/replicas`
- ApplicationSet：Git目录生成器，一模板管多环境
- Notifications：ConfigMap配置Slack/Email通知
- Rollouts：`Canary` CRD + steps(setWeight/pause) + AnalysisTemplate(Prometheus)

### Flux

- GitRepository：`interval:1m` + ref branch + secretRef
- Kustomization：path+prune+healthChecks+postBuild substitute
- HelmRepository+HelmRelease：chart+values+remediation
- ImageRepository+ImagePolicy+ImageUpdateAutomation：自动检测新镜像提交Git

### 多环境

```
fleet-infra/
├── clusters/{dev,staging,production}/
├── infrastructure/base + overlays/
└── apps/base + overlays/
```

### 密钥管理

Sealed Secrets：`kubeseal`加密→提交Git→Controller解密
External Secrets Operator：SecretStore(AWS SM) + ExternalSecret → 自动同步

### GitOps Checklist

Git唯一真相源(PR变更) | 自动同步+selfHeal | 密钥加密(Sealed/External Secrets) | 渐进式交付(Rollouts/Flagger) | 多环境目录隔离 | 保留历史版本回滚

---

## IaC

| 工具 | 语言 | 状态管理 | 云支持 |
|------|------|----------|--------|
| Terraform | HCL | 显式(S3/TF Cloud) | 全平台 |
| Pulumi | Python/TS/Go | 自动(Pulumi Cloud) | 全平台 |
| AWS CDK | Python/TS | CloudFormation | AWS |

### Terraform

结构：`modules/{vpc,eks,rds}/` + `environments/{dev,staging,prod}/`
- Provider：`required_providers`版本锁定 + `default_tags`
- Backend：S3+DynamoDB锁+KMS加密
- 模块化：`variable`→`resource`→`output`，环境通过`module`引用
- 远程状态：`data "terraform_remote_state"` 跨模块引用
- 流程：`init`→`validate`→`fmt`→`plan -out=tfplan`→`apply tfplan`
- 状态：`state list/show/mv/rm` / `import` | Workspace多环境隔离

### Pulumi

ComponentResource自定义资源组 | `pulumi.Config()`读配置 | `pulumi.export()`导出 | `preview`→`up`→`stack output`/`destroy`

### AWS CDK

继承`Stack`，L2 Constructs(`ec2.Vpc`/`eks.Cluster`) | 跨Stack通过构造函数传参 | `synth`→`diff`→`deploy --all`/`bootstrap`

### IaC Checklist

模块化复用 | 环境隔离不同State | 远程状态+锁定 | Provider版本锁 | Secrets Manager/SSM | 统一标签 | Plan审查再Apply | CI/CD集成

---

## 最佳实践

| 层级 | 工具 | 原则 |
|------|------|------|
| 应用部署 | Helm+Kustomize | 模板化+环境差异 |
| 持续交付 | ArgoCD/Flux | Git唯一真相源 |
| 基础设施 | Terraform/Pulumi | 声明式+状态管理 |
| 配置管理 | External Secrets | 密钥外部化 |
| 可观测性 | Prometheus+Grafana | 指标+可视化 |

## 触发词

Kubernetes、K8s、Helm、Kustomize、Operator、CRD、GitOps、ArgoCD、Flux、IaC、Terraform、Pulumi、CDK、基础设施即代码
