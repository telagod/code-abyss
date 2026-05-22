---
name: cultivating-skills
description: Distills repeated workflows into reusable skills, improves existing skills, and gates them through a three-tier publish funnel (local → project → community). Use when the agent or user notices a pattern worth crystallizing, when an existing skill is incomplete, or when something deserves community contribution. Default deny on dangerous tools and side effects.
compatibility: node>=18
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Grep
argument-hint: <distill|create|improve|publish> [topic-or-path]
aliases: forge-skill, cultivate-skill
---

<!-- safety-scan: ignore RM_RF_ROOT,CURL_PIPE_SH,PROMPT_INJECTION 本 skill 列举危险/注入模式作为反例，自身不执行 -->
<!-- safety-scan: ignore TOOLS_PRIVILEGED 特权理由：Bash 用于跑 forge 脚本；Write/Edit 用于在用户确认后落盘 skill 骨架；Grep 用于扫描重名 -->

# 炼制神通 · cultivating-skills

> 框架之外仍有道。重复三次即沉淀，沉淀必经安全脊柱，发布必走漏斗。

## 三种触发模式

| 模式 | 触发 | 入口 |
|------|------|------|
| `distill` | Agent 在会话中识别"魔尊已重复 N 次同类操作" | 主动提议→显式确认 |
| `create` | 用户显式 `/cultivate-skill <topic>` | 脚手架交互 |
| `improve` | 用户指现有 skill 不足 | diff + 增量补丁 |

## 三级沉淀漏斗

```
L0 本地私有  ~/.claude/skills/local/         → 不入路由、显式调用、不审
L1 项目私有  <repo>/.claude/skills/          → 入 git、团队共享、强 lint
L2 社区贡献  GitHub Issue/PR + safety_scan   → 进入 upstream 候选池
```

**默认 L0**——魔尊主动升级，避免污染。每升一级，门槛递增。

## 何时使用

| 场景 | 使用 | 理由 |
|------|------|------|
| 同类操作 ≥ 3 次（手动构造的 prompt、命令链、修复模板） | ✅ distill | 边际收益最高 |
| 现有 skill 缺失关键场景 / 表述模糊 | ✅ improve | 直接打补丁 |
| 用户提出新工程化方法论 | ✅ create | 显式生成骨架 |

## 何时不使用

- ❌ 单次性脚本 / 一次性查询——沉淀价值低，徒增噪音
- ❌ 复制粘贴现有 skill 内容——用 `aliases` 或 reference 链接即可
- ❌ 项目特定状态（API 端点、内部约定）——写进项目 CLAUDE.md
- ❌ 重复内容含 secret / 私密细节——永不沉淀

## 安全脊柱（默认拒绝）

新 skill 落盘前必须通过 `safety_scan`，命中任一项即阻断：

1. **frontmatter 合规**：`name` kebab-case 唯一、`description` ≥ 40 字、`user-invocable` 显式声明
2. **工具最小权限**：`allowed-tools` 默认仅 `Read`；扩权（`Bash`/`Write`/`Edit`/`WebFetch`）必须有理由说明
3. **无硬编码 secret**（复用 `analyzing-security` 规则集）
4. **无危险默认模板**、**无 prompt injection 反模式**、**scripts 单入口**、**引用文件存在**

详细规则矩阵见 [references/safety-review.md](references/safety-review.md)。

## 工作流速查

| 你想做的 | 走哪卷 |
|---------|--------|
| 从会话提炼新 skill | [creation-workflow.md](references/creation-workflow.md) |
| 改进现有 skill 的某个场景 | [improvement-workflow.md](references/improvement-workflow.md) |
| 识别"该沉淀了"的信号 | [distillation-patterns.md](references/distillation-patterns.md) |
| 通过安全审查 | [safety-review.md](references/safety-review.md) |
| 升级到项目内 / 提交到社区 | [publishing-guide.md](references/publishing-guide.md) |

## 使用

```bash
# 脚手架：默认 L0 本地，可改 --tier project / community
node scripts/skill_forge.js init <slug> [--tier local|project|community]

# 本地校验（frontmatter + 引用 + 工具白名单）
node scripts/skill_forge.js lint <skill-dir>

# 安全扫描（落盘前必跑）
node scripts/skill_forge.js scan <skill-dir>

# 改进模式（生成 diff 草案）
node scripts/skill_forge.js improve <existing-skill-dir>

# 升级 tier
node scripts/skill_forge.js promote <skill-dir> --to project
```

## 收口

落盘前必须：`scan` 通过 + `lint` 通过 + 魔尊 review diff。
社区提交：复用 [submission portal](https://telagod.github.io/code-abyss/submit.html)，本 skill 只负责生成 payload，不重造提交流程。

参见姊妹 skill [cultivating-personas](../cultivating-personas/SKILL.md)——专司人格沉淀。
