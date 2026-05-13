---
name: coff0xc-cloud-devsecops
description: 云安全、容器/Kubernetes、Serverless、DevSecOps、供应链、CI/CD 和密钥管理。用于只读优先的配置审查、加固和发布门禁设计。
---

# Coff0xc · 云与 DevSecOps 安全

## 触发

AWS、Azure、GCP、IAM、S3/Blob/GCS、Docker、K8s、镜像、Serverless、CI/CD、SAST、DAST、SCA、SBOM、secret scanning、IaC、Terraform、GitHub Actions、发版流水线、集群配置、镜像权限、依赖来源、配置暴露。

## 边界

- 默认只读审查，不直接连接或修改生产云账号。
- 任何云端写入、策略修改、密钥撤销、资源删除、pipeline 权限变更前必须确认。
- 发现 secret 只报告位置、类型、影响范围和处置流程，不复述完整值。

## 能力矩阵

| 能力域 | 覆盖 | 要点 |
| --- | --- | --- |
| 云配置 | IAM、storage、network、security group、KMS、logging、backup、public exposure | provider + 资产类型证据 |
| 容器镜像 | Dockerfile、base image、root、capabilities、secrets、SBOM、CVE | 区分构建时/运行时 |
| Kubernetes | RBAC、namespace、Pod Security、NetworkPolicy、service account、admission、secrets | 最小权限和隔离 |
| Serverless | function IAM、trigger、env、timeout、VPC、event source、dependency | 权限和事件边界 |
| CI/CD | workflow permissions、OIDC、artifact、cache、pull_request、agent actions | 防止流水线输入劫持 |
| 供应链 | lockfile、SCA、license、maintainer risk、typosquat、dependency confusion、SBOM | 风险分级和替代路径 |
| 密钥管理 | 发现、范围、轮换、撤销、KMS/HSM、访问日志、least privilege | 只报位置和处理流程 |

## 工作流

1. 范围确认：provider、账号/项目、repo、IaC、集群、pipeline、只读边界。
2. 资产清单：读取 Terraform/CloudFormation/K8s/Dockerfile/workflow/lockfile/env example。
3. 风险检查：按身份、网络、数据、运行时、供应链、日志恢复分层审查。
4. 优先级：公网暴露、权限级别、数据敏感性、可利用性、修复成本。
5. 修复方案：最小权限、策略片段、配置修改、pipeline gate、轮换计划。
6. 验证：lint/plan、只读命令、策略模拟、扫描报告、审计日志。

## 验证清单

- IaC：validate、fmt、plan、policy check。
- Container：build、trivy/grype、docker history、运行用户检查。
- K8s：manifest lint、RBAC can-i、namespace 隔离检查。
- CI/CD：workflow permission diff、触发条件和 secret 使用路径。

## 反模式

- 把 provider 最佳实践清单原样贴给用户，不看实际配置。
- 发现 secret 后复述完整值。
- 只修镜像 CVE，不处理 root、capability、secret 和 network。
- 未确认就运行云端修改命令。
