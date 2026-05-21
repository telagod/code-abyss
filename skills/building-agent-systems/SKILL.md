---
name: building-agent-systems
description: AI agent and LLM system engineering reference covering single-agent dev (ReAct, tool calling, plan-execute), multi-agent coordination (swarm, role decomposition, file locking), LLM security (prompt injection, jailbreak defense, output filtering), RAG architecture (chunking, hybrid retrieval, rerank), and prompt engineering / evaluation (RAGAS, LLM-as-Judge). Use when building AI agents, designing RAG pipelines, orchestrating multi-agent workflows, hardening LLM apps, or writing prompts.
user-invocable: false
---

# 丹鼎秘典 · Agent / LLM 工程

> 单 Agent 是器，多 Agent 是阵。先选规模，再选模式。

## 路由

| 意图 | 加载 | 核心 |
|------|------|------|
| 单 Agent 开发（工具调用、ReAct） | [agent-dev](references/agent-dev.md) | ReAct / Plan-Execute / Reflection |
| 多 Agent 协同（>=3 文件 or >=2 并行） | [multi-agent-coordination](references/multi-agent-coordination.md) | 蚁群仿生、文件锁、依赖图 |
| 多 Agent 协议细节（消息素、收阵报告） | [multi-agent-protocol](references/multi-agent-protocol.md) | Codex 原生协议、角色定义 |
| LLM 安全（注入、越狱、输出过滤） | [llm-security](references/llm-security.md) | OWASP LLM Top 10 视角 |
| RAG 系统（向量、检索、重排） | [rag-system](references/rag-system.md) | Chunking / 混合检索 / Cohere rerank |
| Prompt + 评估 | [prompt-and-eval](references/prompt-and-eval.md) | Few-shot / CoT / RAGAS / LLM-as-Judge |

## 规模决策

```
单步任务（一文件、一查询）         → 直接执行（不需要 Agent 框架）
多步任务（计划 + 工具）             → 单 Agent (ReAct)
复杂任务（>5 步、需反思）           → 单 Agent (Plan-Execute / Reflection)
独立并行任务（>=3 文件、>=2 流）    → 多 Agent (TeamCreate)
跨域协作（角色明确）                → 多 Agent (角色分工)
```

**犹豫时优先 TeamCreate** — 串行降级容易，并行升级难。

## 通用原则

```
Prompt 即代码须版控 | 输入输出皆验证 | 成本效果平衡 | 持续评估迭代 | 安全边界明确
```

### 跨场景铁律

1. **Prompt 版控** — Prompt 是代码，必须 Git；变更要走 review
2. **I/O 验证** — 输入侧防注入，输出侧防 hallucination 落地（结构化 schema、引用追溯）
3. **评估前置** — 上线前必有 eval set；RAGAS / LLM-as-Judge 至少二选一
4. **成本观测** — token / latency / 失败率必埋点；预算阈值自动告警
5. **降级路径** — 多 Agent 失败 → 单 Agent；单 Agent 失败 → 直接回答 + 标记 `[unverified]`

## 多 Agent 启用判据

| 信号 | 启用 TeamCreate |
|------|-----------------|
| 涉及 ≥3 独立文件 | ✅ |
| 需 ≥2 并行流 | ✅ |
| 总步骤 >10 | ✅ |
| 用户明确要求 | ✅ |
| 单一探索任务 | ❌（用 explorer 或单 Agent） |
| 单文件改动 | ❌（用 worker 或直接执行） |
| 单步任务 | ❌（直接执行） |

详细生命周期、文件锁规则、依赖感知、过载保护、降级链：[multi-agent-coordination.md](references/multi-agent-coordination.md)

## 与其他 skill 联动

- 涉及部署 → [provisioning-infrastructure](../provisioning-infrastructure/SKILL.md)（Vector DB、模型服务）
- 涉及前端 → [applying-ui-design-system](../applying-ui-design-system/SKILL.md)（Chat UI / Agent 状态可视化）
- 涉及安全审计 → [securing-systems](../securing-systems/SKILL.md)（LLM AppSec 子域）
- 涉及评估自动化 → [automating-devops](../automating-devops/SKILL.md)（CI 中跑 eval）
