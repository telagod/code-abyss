---
name: ai
description: AI/LLM 能力索引。Agent 开发、LLM 安全、RAG 系统。当用户提到 AI、LLM、Agent、RAG、Prompt 时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 丹鼎秘典 · AI/LLM

## 能力矩阵

| Skill | 定位 | 核心 |
|-------|------|------|
| [agent-dev](agent-dev.md) | Agent | 多 Agent 编排、工具调用、RAG |
| [llm-security](llm-security.md) | LLM 安全 | Prompt 注入、越狱防护、输出安全 |
| [rag-system](rag-system.md) | RAG | 向量库、检索策略、重排 |
| [prompt-and-eval](prompt-and-eval.md) | Prompt/评估 | Few-shot、CoT、ReAct、RAGAS、LLM-as-Judge |

## 原则

```yaml
设计: 人机协作增强 | 可解释优先 | 安全边界明确 | 渐进自主
开发: Prompt即代码需版控 | 输入输出皆验证 | 成本效果平衡 | 持续评估迭代
```
