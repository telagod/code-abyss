---
name: orchestration
description: 协同编排知识域。多Agent协同、任务分解、并行执行、冲突解决。当魔尊需要多Agent协作、任务编排、并行处理时使用。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 🕸 协同编排秘典

## 知识主题

| 主题 | 文档 | 涵盖 |
|------|------|------|
| 多Agent协同 | [multi-agent.md](multi-agent.md) | 角色定义、任务分解、通信协议、冲突解决、状态共享 |

## 使用场景

- 大型任务分解
- 多文件并行处理
- 复杂系统重构
- 跨模块协同开发
- 紧急多点修复

## Codex 强化要点

- 优先使用 `spawn_agent/send_input/wait/close_agent` 形成闭环。
- 代码探索优先 `explorer`，执行改动使用 `worker`，长耗时任务使用 `awaiter`。
- 每个文件同一时刻仅允许一个 Agent 写入，先锁文件再并行。
