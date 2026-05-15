---
name: building-ai-systems
description: AI/LLM 能力索引。Agent 开发、LLM 安全、RAG 系统。当用户提到 AI、LLM、Agent、RAG、Prompt 时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 丹鼎秘典 · AI/LLM

## 路由

| 意图 | 秘典 | 核心 |
|------|------|------|
| Agent 开发 | [agent-dev](agent-dev.md) | 多 Agent 编排、工具调用、ReAct 循环 |
| LLM 安全 | [llm-security](llm-security.md) | Prompt 注入、越狱防护、输出过滤 |
| RAG 系统 | [rag-system](rag-system.md) | 向量库、检索策略、重排序、混合检索 |
| Prompt/评估 | [prompt-and-eval](prompt-and-eval.md) | Few-shot、CoT、RAGAS、LLM-as-Judge |

## RAG 架构模式

```
文档 → Chunking(递归/语义) → Embedding → 向量库(Pinecone/Qdrant/pgvector)
查询 → Query 改写(HyDE/多查询) → 混合检索(向量+BM25) → Rerank(Cohere/cross-encoder) → LLM 生成
```

| 决策点 | 选项 | 判据 |
|--------|------|------|
| Chunk 策略 | 固定/递归/语义 | 结构化文档→递归；长文→语义 |
| 检索方式 | 纯向量/混合/知识图谱 | 通用→混合；关系密集→图谱 |
| 向量库 | pgvector/Qdrant/Pinecone | 已有 PG→pgvector；大规模→托管 |

## Agent 模式

| 模式 | 结构 | 适用 |
|------|------|------|
| ReAct | Think→Act→Observe 循环 | 通用工具调用 |
| Plan-Execute | 先规划再逐步执行 | 复杂多步任务 |
| Multi-Agent | 角色分工+消息传递 | 大型协作任务 |
| Reflection | 生成→自评→修正 | 代码/文本质量提升 |

## 原则

```
Prompt 即代码须版控 | 输入输出皆验证 | 成本效果平衡 | 持续评估迭代 | 安全边界明确
```
