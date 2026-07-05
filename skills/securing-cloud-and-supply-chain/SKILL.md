---
name: securing-cloud-and-supply-chain
description: 云原生与软件供应链安全防御。容器/K8s 加固、Service Mesh、CI/CD 安全、SLSA/SBOM/Sigstore、云 IAM、Secrets 管理、IaC 安全。Use when hardening Kubernetes clusters, auditing CI/CD pipelines, implementing supply chain security, managing cloud IAM, or reviewing IaC code.
user-invocable: false
---

# 云原生与供应链安全

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/security/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> 默认怀疑一切外来字节：镜像、依赖、IaC 模块、CI runner、IAM trust。能签就签，能锁就锁，能最小就最小。

## 路由

| 意图 | 秘典 | 核心 |
|------|------|------|
| 容器/K8s 加固 | [container-and-k8s](references/container-and-k8s.md) | 容器逃逸、RBAC、PSS、NetworkPolicy、Service Mesh、Admission |
| 软件供应链 | [supply-chain](references/supply-chain.md) | SLSA、Sigstore、SBOM、CI/CD OIDC、attestation、VEX |
| 云 IAM 与 Secrets | [cloud-iam-and-secrets](references/cloud-iam-and-secrets.md) | IAM 反模式、AssumeRole、Vault、KMS、IaC、Workload Identity |

## 何时使用

| 场景 | 用本 skill | 不用 |
|------|-----------|------|
| K8s manifest / Helm chart 安全审查 | ✅ | — |
| CI/CD pipeline (GitHub Actions / GitLab CI) 加固 | ✅ | — |
| Terraform / Pulumi / CloudFormation 评审 | ✅ | — |
| AWS/GCP/Azure IAM policy 审查 | ✅ | — |
| 镜像扫描与签名链路设计 | ✅ | — |
| 应用层 Web/API 漏洞 (SQLi/XSS/SSRF) | — | 用 `securing-systems` |
| 红队 C2/横移/免杀 | — | 用 `securing-systems/red-team` |
| 集群部署/Helm 模板编写 (非安全视角) | — | 用 `provisioning-infrastructure` |
| 一般架构设计与权衡 | — | 用 `designing-architectures` |

## 通用铁律

1. **Least privilege by default** — 任何 Role/IAM/SA/Token 起手就是空集合，按需求逐项添加，禁通配 `*` 与 `Action: *`。
2. **Immutable infrastructure** — 镜像用 digest 不用 tag，IaC state 不允许人工 drift，部署后只重建不改造。
3. **Sign everything, verify everywhere** — 镜像、artifact、commit、SBOM 必须签名；准入控制必须 verify，否则等于没签。
4. **Secrets never in plaintext** — 不进 git、不进 env file、不进 ConfigMap、不进 Terraform state；Vault/Secret Manager + 短期凭证。
5. **Defense in depth** — 镜像扫描 + admission policy + runtime detection + network policy + audit log，单层失守不致命。
6. **OIDC over long-lived tokens** — CI 到云、Pod 到云、Service 到 Service 一律 federated identity，废弃 access key。
7. **Provenance is non-negotiable** — 不知道来源的二进制不上生产；SLSA L3+ 是目标线。
8. **Zero trust east-west** — 内网即外网，mTLS 默认开启，NetworkPolicy 默认拒绝。

## 执行链

```
审查：清单 → 威胁建模 → 配置对照 → 风险分级 → 修复 PR → 验证回归
应急：定位失陷面 → 撤凭证 → 隔离工作负载 → 取证镜像 → 根因 → 加固准入
```

## 优先级红线

| 红线 | 立即处置 |
|------|---------|
| Secrets 已进 git history | 撤销凭证 → rewrite history → 通报 |
| 公网暴露 K8s API server | 关闭 → IP 白名单 → 审计访问日志 |
| privileged: true Pod 跑业务 | 拒绝准入 → 重构镜像 → PSS restricted |
| CI 用 long-lived AWS key | 切 OIDC → 撤销 key → 审计旧密钥使用 |
| `Action: *` IAM policy | 收敛权限 → CloudTrail 审计实际使用 |

## 与其他 skill 联动

- 应用层漏洞（SQLi、XSS、反序列化、代码污点）→ `securing-systems/code-audit`、`pentest`
- 红队对抗与 C2 → `securing-systems/red-team`
- SOC 检测/Sigma/IR → `securing-systems/blue-team`
- 集群与 Helm/GitOps 部署（非安全视角）→ `provisioning-infrastructure`
- API/认证架构设计 → `designing-architectures/security-arch`
- DevOps 流水线工程实践 → `automating-devops`

## 输出约束

- 反例使用 RFC 5737 (`192.0.2.0/24`、`198.51.100.0/24`) 或 `example.com`
- 凭证一律 `<REDACTED>` / `AKIA<EXAMPLE>` 占位
- 发现真实泄漏只报位置和处置流程，不复述完整值
- 修复方案必须给出最小权限策略片段，不抛"参考最佳实践"了事
