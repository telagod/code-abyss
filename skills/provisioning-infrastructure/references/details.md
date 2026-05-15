# 云原生基础设施详细参考

## Kubernetes

### Helm

结构：`Chart.yaml` + `values.yaml` + `templates/` + `_helpers.tpl`
- values：image/replicaCount/resources/autoscaling/probes/ingress/persistence
- 配置变更触发滚动：`checksum/config: {{ include | sha256sum }}`
- 安全：`runAsNonRoot: true, runAsUser: 1000`
- 命令：`helm lint` → `template --debug` → `install -f values-prod.yaml` → `upgrade --reuse-values` / `rollback`

### Kustomize

`base/` + `overlays/{dev,staging,production}/`
base：resources/commonLabels/configMapGenerator | overlay：namespace/patches/replicas/images
命令：`kubectl apply -k overlays/production` / `kubectl diff -k`

### Operator

CRD(openAPIV3Schema spec/status) → Controller(Get CR→构建期望态→Create/Update→更新Status) → OwnerReferences 级联删除
初始化：`operator-sdk init` → `create api` → `make manifests install`

### 部署策略

| 策略 | 实现 | 场景 |
|------|------|------|
| 滚动更新 | maxSurge/maxUnavailable | 默认 |
| 蓝绿 | 双 Deployment + Service selector 切换 | 零停机 |
| 金丝雀 | stable(9)+canary(1) 共享 Service | 渐进验证 |
| Flagger | `Canary` CRD + 自动分析指标 | 自动化金丝雀 |

## GitOps

| 特性 | ArgoCD | Flux |
|------|--------|------|
| UI | 强大 | Weave GitOps |
| 多集群 | 原生 | 原生 |
| 镜像自动更新 | Image Updater | 原生 |
| 渐进交付 | Argo Rollouts | Flagger |

ArgoCD：Application(source+destination) + `automated(prune:true, selfHeal:true)` + ApplicationSet(Git 目录生成器) + Rollouts(canary steps+AnalysisTemplate)
Flux：GitRepository → Kustomization(path+prune+healthChecks) + HelmRelease + ImageUpdateAutomation

### 多环境

```
fleet-infra/
├── clusters/{dev,staging,production}/
├── infrastructure/base + overlays/
└── apps/base + overlays/
```

密钥：Sealed Secrets(`kubeseal`加密提交 Git) | External Secrets Operator(AWS SM→自动同步)

## IaC

| 工具 | 语言 | 状态管理 | 云支持 |
|------|------|----------|--------|
| Terraform | HCL | S3+DynamoDB | 全平台 |
| Pulumi | Python/TS/Go | Pulumi Cloud | 全平台 |
| AWS CDK | Python/TS | CloudFormation | AWS |

Terraform：`modules/{vpc,eks}/` + `environments/{dev,prod}/` → `init` → `validate` → `plan -out=tfplan` → `apply tfplan`
Pulumi：ComponentResource + `pulumi.Config()` + `preview` → `up`
CDK：L2 Constructs + 跨 Stack 传参 + `synth` → `diff` → `deploy`
