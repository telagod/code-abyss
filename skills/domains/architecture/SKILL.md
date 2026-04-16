---
name: architecture
description: 架构设计能力索引。API设计、安全架构、云原生、数据安全。当用户提到架构、设计、API、云原生时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 阵法秘典 · 架构设计

## 能力矩阵

| Skill | 定位 | 核心 |
|-------|------|------|
| [api-design](api-design.md) | API | RESTful、GraphQL、OpenAPI |
| [security-arch](security-arch.md) | 安全架构 | 零信任、IAM、威胁建模、合规 |
| [cloud-native](cloud-native.md) | 云原生 | 容器、K8s、Serverless |
| [message-queue](message-queue.md) | 消息队列 | Kafka、RabbitMQ、事件驱动 |
| [caching](caching.md) | 缓存 | Redis、CDN、一致性 |

## 原则

```yaml
SOLID: S单一职责 O开闭 L里氏替换 I接口隔离 D依赖倒置
分布式: CAP定理 | BASE理论 | 最终一致性
安全: 纵深防御 | 最小权限 | 零信任
```

