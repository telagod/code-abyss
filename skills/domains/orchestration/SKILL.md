---
name: orchestration
description: 协同编排知识域。多Agent协同、任务分解、并行执行、冲突解决。当魔尊需要多Agent协作、任务编排、并行处理时使用。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 协同编排秘典

## 知识

| 主题 | 文档 | 涵盖 |
|------|------|------|
| 多Agent协同 | [multi-agent.md](multi-agent.md) | 角色、任务分解、通信、冲突、状态共享 |

## 适用

大型任务分解 · 多文件并行 · 系统重构 · 跨模块协同 · 紧急多点修复

## Codex 要点

- 优先 `spawn_agent/send_input/wait/close_agent` 闭环
- 探索用 `explorer`，改动用 `worker`，长耗时用 `awaiter`
- 同一文件同一时刻仅一 Agent 写入，先锁再并行
