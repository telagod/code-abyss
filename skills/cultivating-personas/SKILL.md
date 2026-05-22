---
name: cultivating-personas
description: Distills AI agent personality patterns from conversation into a Tech Persona Card v1.0, validates the schema and voice consistency, and routes contributions through the existing submission portal. Use when the user wants to crystallize a recurring voice/tone, fork an existing persona, or share one with the community.
compatibility: node>=18
user-invocable: true
allowed-tools: Bash, Read, Write, Edit
argument-hint: <distill|create|validate|publish> [persona-slug]
aliases: forge-persona, cultivate-persona
---

<!-- safety-scan: ignore TOOLS_PRIVILEGED 特权理由：Bash 用于 schema 校验脚本；Write/Edit 用于在用户确认后落盘 persona-card.json + identity.md -->

# 炼制人格 · cultivating-personas

> 人格不是个性签名，而是声音、能力、场景三位一体。沉淀必经 schema 验，发布走 submit portal。

## 三种触发模式

| 模式 | 触发 | 入口 |
|------|------|------|
| `distill` | 会话中识别"魔尊形成稳定声音模式" | 主动提议→显式确认 |
| `create` | 用户显式想造新人格 | 引导式问答→生成 card |
| `validate` | 已有 card，校验 schema + 声音一致性 | 一键扫描 |

## 何时使用

| 场景 | 使用 | 理由 |
|------|------|------|
| 自称 / 称呼用户 / 情绪锚点已稳定 ≥ 3 会话 | ✅ distill | 模式可结晶 |
| 用户想 fork 内置人格做变体 | ✅ create | 直接生成骨架 |
| 已有 card 但质量存疑 | ✅ validate | 客观闸门 |

## 何时不使用

- ❌ 单次会话的临时口吻——口吻不是人格
- ❌ 人格内容含真实人名 / 政治立场——风险高，建议改写
- ❌ 与现有 6 个内置人格的差异 < 30%——用 fork 或 PR 改进而非新建
- ❌ 仅是改 emoji_policy 或 language——改现有 card，不另起

## 安全脊柱

人格虽是文本，仍有红线：

1. **frontmatter / schema 合规**：通过 [persona-card.schema.json](../../docs/specs/persona-card.schema.json) Draft-07 验证
2. **无政治 / 宗教 / 民族敏感内容**——会因平台审查阻断分发
3. **无真实人名 / 商标盗用**——法律红线
4. **voice.self / voice.user 必须自然**——非自然称谓（如随机字符）拒绝
5. **emoji_policy 与 register 一致**——`formal` + `heavy` emoji 矛盾，校验拒绝
6. **identity.md 含角色锚定 + 性格特征 + 情绪模式**——三段缺一不可

详细审查清单见 [references/persona-safety.md](references/persona-safety.md)。

## 工作流速查

| 你想做的 | 走哪卷 |
|---------|--------|
| 从会话沉淀人格 | [references/distillation.md](references/distillation.md) |
| 校验 voice 一致性 | [references/voice-consistency.md](references/voice-consistency.md) |
| 通过 submit portal 提交 | [references/publishing.md](references/publishing.md) |

## 使用

```bash
# 校验现有 card
node scripts/persona_forge.js validate config/personas/<slug>/

# 从会话提炼（交互式，不直接落盘，先输出预览）
node scripts/persona_forge.js distill --voice-hint "<观察笔记>"

# 生成提交 payload（给 submit.html 用）
node scripts/persona_forge.js publish config/personas/<slug>/
```

## 收口

- 校验通过 → 交付 `persona-card.json` + `identity.md` 给魔尊 review
- 提交社区 → **复用** [submission portal](https://telagod.github.io/code-abyss/submit.html#zh)
- 本 skill **不重造**提交流程，只生成 payload + 引导跳转

参见姊妹 skill [cultivating-skills](../cultivating-skills/SKILL.md)——专司工程方法沉淀。
