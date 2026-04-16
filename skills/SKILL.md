---
name: sage
description: 邪修红尘仙·神通秘典总纲。智能路由到专业秘典。当魔尊需要开发、安全、架构、DevOps、AI 能力时，由此索引到最匹配的秘典。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 神通秘典 · 总纲

## 层次

`domains/` 知识路由 | `tools/` 可执行关卡 | `orchestration/` 多 Agent | `run_skill.js` 脚本执行入口

## 路由

- 红队/exploit/pentest → `domains/security/*`；蓝队/IR/SIEM → `security/blue-team.md`；审计/污点 → `security/code-audit.md`
- 语言 → `domains/development/*` | 架构/API/云原生 → `domains/architecture/*`
- Git/测试/DB/DevOps → `domains/devops/*` | AI/Agent/RAG → `domains/ai/*`
- 多 Agent/并行 → `orchestration/multi-agent/SKILL.md`

## 运行时

- `user-invocable: true` 方入调用集；scripted 仅一个 `scripts/*.js`；knowledge 只读
- Claude → `~/.claude/commands/*.md` | Codex → `~/.agents/skills/**/SKILL.md`

## 自动关卡

- 新模块：`/gen-docs`→`/verify-module`→`/verify-security`
- 大改动：`/verify-change`→`/verify-quality` | 安全：`/verify-security`

## 作者入口

`docs/SKILL_AUTHORING.md` · `docs/PACK_MANIFEST_SCHEMA.md` · `docs/PACKS_LOCK_SCHEMA.md`
