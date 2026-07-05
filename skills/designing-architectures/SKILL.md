---
name: designing-architectures
description: Architecture knowledge reference covering API design, security architecture, cloud-native patterns, caching strategies, message queues, and data security. Use when designing system architecture, APIs, or cloud-native infrastructure.
user-invocable: false
---

# 阵法秘典 · 架构设计

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/backend/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

## 路由

| 意图 | 秘典 | 核心 |
|------|------|------|
| API 设计 | [api-design](api-design.md) | RESTful、GraphQL、gRPC、OpenAPI |
| 安全架构 | [security-arch](security-arch.md) | 零信任、IAM、威胁建模、合规 |
| 云原生 | [cloud-native](cloud-native.md) | 容器、K8s、Serverless、Service Mesh |
| 消息队列 | [message-queue](message-queue.md) | Kafka、RabbitMQ、事件驱动、CQRS |
| 缓存 | [caching](caching.md) | Redis、CDN、一致性、穿透/雪崩 |

## 决策矩阵

| 决策点 | 选项 A | 选项 B | 判据 |
|--------|--------|--------|------|
| 同步 vs 异步 | REST/gRPC 同步调用 | 消息队列异步 | 延迟敏感→同步；解耦/削峰→异步 |
| 单体 vs 微服务 | 单体(模块化) | 微服务 | 团队<5→单体；独立部署需求→微服务 |
| SQL vs NoSQL | RDBMS | MongoDB/DynamoDB | 强一致/关联→SQL；灵活 schema/高吞吐→NoSQL |
| 缓存策略 | Cache-Aside | Write-Through | 读多写少→Aside；写后即读→Through |
| API 风格 | REST | GraphQL | 资源型 CRUD→REST；复杂聚合/前端驱动→GraphQL |
| 事件架构 | 事件通知 | 事件溯源(ES) | 简单解耦→通知；审计/回溯→ES+CQRS |

## 原则

```
SOLID: S单一职责 O开闭 L里氏替换 I接口隔离 D依赖倒置
分布式: CAP定理 | BASE最终一致 | 幂等设计
安全: 纵深防御 | 最小权限 | 零信任
扩展: 水平优先 | 无状态服务 | 数据分片
```

