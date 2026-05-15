---
name: automating-devops
description: DevOps 能力索引。Git、测试、DevSecOps、数据库。当用户提到 DevOps、CI/CD、Git、测试时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 炼器秘典 · DevOps

## 路由

| 意图 | 秘典 | 核心 |
|------|------|------|
| 版本控制 | [git-workflow](git-workflow.md) | Git 分支策略、PR 流程、rebase vs merge |
| 测试 | [testing](testing.md) | 单元/集成/E2E、TDD、覆盖率 |
| 安全开发 | [devsecops](devsecops.md) | CI/CD 安全、SAST/DAST、供应链 |
| 数据库 | [database](database.md) | SQL/NoSQL 选型、索引优化、迁移 |
| 性能 | [performance](performance.md) | Profiling、火焰图、基准/负载测试 |
| 可观测 | [observability](observability.md) | 日志/指标/追踪三支柱、SLO/SLI |
| 成本 | [cost-optimization](cost-optimization.md) | FinOps、右尺寸、Spot、自动伸缩 |

## CI/CD 管道模式

| 阶段 | 动作 | 工具示例 |
|------|------|----------|
| Commit | lint + unit test + SAST | ESLint、pytest、Semgrep |
| Build | 构建 + 镜像打包 | Docker、Buildpacks |
| Test | 集成测试 + E2E | Playwright、k6 |
| Security | DAST + 依赖扫描 + 密钥检测 | OWASP ZAP、Trivy、gitleaks |
| Deploy | 渐进发布(canary/blue-green) | ArgoCD Rollouts、Flagger |
| Verify | 冒烟测试 + SLO 校验 | Prometheus、Grafana |
| Rollback | 自动回滚(SLO 违约) | ArgoCD、Helm rollback |

## 原则

```
自动化一切 | 快速反馈(<10min) | 主干开发短分支 | 不可变制品 | 环境即代码
```