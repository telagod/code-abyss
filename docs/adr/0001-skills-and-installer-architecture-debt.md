---
status: accepted
date: 2026-05-16
deciders: telagod
tags: [architecture, refactor, skills, installer, breaking-change]
---

# ADR-0001：Skills 与 Installer 架构债清算

## Context

code-abyss 自 v1.0 演进到 v2.1.11 期间，逐步生长出两套被认为是"核心资产"的子系统：

1. **skills 子系统**：`skills/` 目录下 26 个 SKILL.md，按 `tools/` / `domains/` / `orchestration/` 三类分目录，部分类别下还有二级分类（`domains/office/{docx,pdf,pptx,xlsx}/`、`domains/frontend-design/{glassmorphism,liquid-glass,...}/`），再加上 root `skills/SKILL.md` 总纲与各父目录的 router SKILL.md。
2. **installer 子系统**：`bin/` 下 26 个 JS 文件、5364 LOC、3256 LOC 测试，负责 4 个 install target（claude / codex / gemini / openclaw）× N 个 pack 的产物生成、备份、卸载。

2026-05-16 对照 Anthropic 生态当前主流做法（[Agent Skills 官方 spec](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)、[agentskills.io spec](https://agentskills.io/specification)、[obra/superpowers](https://github.com/obra/superpowers)、[anthropics/skills](https://github.com/anthropics/skills)）后发现：**当前架构在 spec 合规度、复杂度收益比、生态对接面三方面同时存在结构性偏差**。本 ADR 记录这次诊断、给出改造路线、留决策位等待 scope 选择。

## Decision

**2026-05-16：选定 Scope-L（v3.0 大重构）**，由 telagod 决策。

含 17 项问题的全量解决：A + B + C + D + E + F + α + β + γ + δ + ε + ζ + η + θ + P7 + P8 + P17。

执行节奏：拆 **5 个 Phase**，每 Phase 独立 PR、独立可回滚，单 PR ≤ ~500 LOC 改动面。每 Phase 完成后 main 仍处于可发布状态。

### Phase 路线图

| Phase | 主题 | 含动作 | 破坏性 | 预估 PR 数 | 可发布版本 |
|---|---|---|---|---|---|
| **1** | installer 内部清理 | α + β + γ + ε + η + P17 | 否（CLI surface 不破） | 4–5 | v3.0.0-alpha.1 |
| **2** | 工程层去耦 + backup 重做 | ζ + θ | 是（旧 `.sage-backup` 用户重装） | 2 | v3.0.0-alpha.2 |
| **3** | skills 扁平化 | A + D + E + F + P7 | 是（skills 路径全变） | 3–4 | v3.0.0-beta.1 |
| **4** | skills 内容打磨 | B + C + P8 | 否（frontmatter 迁子键 + 描述重写） | 2 | v3.0.0-beta.2 |
| **5** | 生态接入 | δ | 否（新增） | 1 | v3.0.0 |

候选 scope（已决，记录用）：

- ~~Scope-S（小修缝合）~~：B + C + D。
- ~~Scope-M（中修瘦身）~~：S + α + β + γ + η + ε + θ + P17。
- **Scope-L（v3.0 大重构）✅**：M + A + E + F + δ + ζ + P7 + P8。

## 证据：量化对照

### Skills 子系统

| 维度 | code-abyss 现状 | obra/superpowers | anthropics/skills | Spec 要求 |
|---|---|---|---|---|
| skill 总数 | 26 | 14 | 17 | — |
| 嵌套深度 | **3–4 层**（最深 8 层 ooxml schemas） | flat（1 层） | flat（1 层） | references 最多 1 层 |
| 平均 SKILL.md 行数 | 84（office 类 200–487） | 229 | ~285 | < 500 |
| 父目录是否再挂 SKILL.md | **是**（`frontend-design/SKILL.md` + `frontend-design/glassmorphism/SKILL.md` 共存） | 否 | 否 | spec 禁止 skill 嵌 skill |
| description 风格 | 中文短叙事 (~80 字) | 单句 "Use when …" | 触发词堆叠 + "Do NOT use" 反触发 | 第三人称 + what + when + keywords |
| 自创顶层 frontmatter 字段 | 4 个（`user-invocable` / `disable-model-invocation` / `aliases` / `argument-hint`） | 无 | 无 | 仅 6 字段，扩展走 `metadata:` 子键 |
| 中央 dispatcher | `run_skill.js` + 锁 + spawn | 无 | 无 | 无 |

### Installer 子系统

| 模块 | 文件数 | LOC | 服务对象 |
|---|---:|---:|---|
| `bin/install.js` | 1 | **1265** | 编排入口（god object） |
| `bin/packs.js` | 1 | 581 | pack CLI 子命令外壳 |
| `bin/adapters/{claude,codex,gemini,openclaw}.js` | 4 | 941 | 4 个 target |
| `bin/lib/pack-*.js` + `vendor-providers/*` | 11 | ~1100 | **仅 2 个 pack**（abyss core + gstack 可选） |
| `bin/lib/gstack-{claude,codex,gemini}.js` | 3 | **651** | 同 1 个 pack × 3 host |
| `bin/lib/{skill,style,target,utils,ccstatusline}.js` | 5 | 743 | 内部抽象 |
| **bin/ 合计** | **26** | **5364** | |
| `test/` | 24 | **3256** | — |

对照：superpowers 跨 5 个 host（Claude/Codex/Gemini/Cursor/Copilot）的分发实现是 `.claude-plugin/plugin.json` **~20 行 JSON**。

## 问题清单（17 项）

### Skills · Critical（违 spec，必改）

**P1. SKILL 嵌套 SKILL 违反 spec self-contained 原则**
- 例：`skills/domains/frontend-design/SKILL.md` 同时与 `skills/domains/frontend-design/glassmorphism/SKILL.md` 共存
- 影响：父 SKILL.md 在做"目录索引页"，但 Claude 路由器根本不读目录，所有 26 个 description 全量进 system prompt 由模型自主选
- 后果：人工搭的目录树对运行时零价值，只是给开发者自己看；维护负债 O(n)

**P2. references 深度爆表至 8 层**
- 例：`skills/domains/office/docx/ooxml/schemas/ecma/fouth-edition/...`
- 来源：吞了上游 ooxml schema，未做扁平化
- 后果：违 spec "references one level deep"、仓库膨胀、npm tarball 体积

**P3. frontmatter 顶层自创字段超出规范**
- 自创字段：`user-invocable` / `disable-model-invocation` / `aliases` / `argument-hint`
- 合规做法：spec 允许 `metadata:` 子键扩展
- 后果：任何合规 validator 一跑就报错；Claude 客户端 frontmatter parser 升级时全部 26 个 SKILL.md 一起红

### Skills · Major（过度抽象）

**P4. `skills/SKILL.md` 根 router 是自创概念**
- 两个对照样本（社区头牌 + 官方）都没有"总纲 SKILL"
- 现实：Claude 启动时所有 metadata 常驻 system prompt（~100 tokens/个），模型自己挑
- 后果：浪费 token、模糊触发边界、每加 skill 改 router

**P5. `run_skill.js` + 目标锁 + spawn 是为 5 个工具的航母**
- 服务对象：`verify-{change,quality,security,module}` + `gen-docs` 共 5 个脚本
- 复杂度：dispatcher + 异步锁 + 退出码透传 + jest 覆盖 ≈ 800+ LOC
- 对照：spec 与生态把脚本当 SKILL.md body 里的普通 bash 调用（`python scripts/foo.py`）
- 后果：ROI 严重不对称

### Skills · Minor

**P6. description 中文短叙事 + 缺反触发**
- 现状：纯中文 ~80 字
- 对照 anthropic/skills docx：触发词堆叠 + "Do NOT use for ..." 反触发 + 800 字符
- 后果：英文 task / 姊妹 skill 边界模糊场景命中率打折

**P7. 命名缺 gerund 形式**
- 现状：`frontend-design` `architecture` `mobile`（名词）
- 推荐：spec 推 `processing-pdfs` `analyzing-spreadsheets`（动名词）
- 后果：触发"做什么动作"的语义信号弱

**P8. office 类 SKILL.md 偏大（200–487 行）**
- 接近 spec 上限 500 行
- 来源：上游 anthropic/skills 原文照搬
- 后果：单次加载 token 成本高、超出阈值时一票否决

### Installer · Critical（结构债）

**P9. `bin/install.js` 1265 行 god object**
- 一个文件耦合：参数解析 + target 选择 + auth 检测 + core copy + adapter post + pack sync + bootstrap + ccstatusline + backup + uninstall manifest
- 后果：churn rate 高、bug 复发率高（v2.1.11 ccstatusline bug 就来自此处耦合）

**P10. pack 子系统为想象中的多 pack 生态搭航母**
- 实际：2 个 pack（abyss core + gstack 可选）
- 投入：~2150 LOC（pack-registry / vendor-providers / pack-reports / pack-bootstrap / pack-docs / pack-vendor）+ ~500 LOC 测试
- 性质：教科书级 YAGNI 违反

**P11. gstack 三件套违 DRY**
- 现状：`gstack-{claude,codex,gemini}.js` 共 651 LOC 为同一上游 pack 在三个 host 各写一份独立逻辑
- OpenClaw 上线后没有 `gstack-openclaw.js`——证明架构无法 scale
- 应当：1 份 pack 实现 × 4 host adapter 接口

### Installer · Major（自建抽象对抗生态）

**P12. 4 套 internal registry 是 over-abstraction**
- `skill-registry.js` (203) + `style-registry.js` (214) + `target-registry.js` (81) + `pack-registry.js` (400) = 898 LOC
- 消费者只有 `bin/install.js` 一家
- 特别：`target-registry.js` 81 行只为枚举 4 个常量字符串

**P13. backup / uninstall 机制比 npm 标准复杂 5 倍**
- 现状：`.sage-backup/manifest.json` + 动态生成 `.sage-uninstall.js`
- 对照：npm + plugin marketplace 零自建卸载机制，靠 lifecycle 兜底
- 替代：idempotent merge + git diff 提示

**P14. ccstatusline 焊死在 install.js**
- 性质：Claude 专属 + 第三方包装，应当是 plugin 而非 core feature
- 历史：v2.1.11 的 `flexMode` Zod 验证坑 就来自此耦合
- 后果：install smoke 不覆盖第三方包 schema 变化，bug 容易潜伏

**P15. 命名与错误信息泄漏人格风格**
- 例：`.sage-backup` / `.sage-uninstall.js` / 错误信息含"魔尊..."
- 原则：人格属于 output style（运行时），不应进入文件路径与 CLI surface（工程层）
- 后果：缩窄企业/CI 可被采用的场景

### Installer · Minor

**P16. test/ 体量 60.7%（3256/5364）**
- 健康值：30–80%，本项不算病
- 问题：大量测试在测自建抽象层，抽象瘦了测试也能瘦

**P17. `bin/packs.js` 11 个 npm script 命令组膨胀**
- 实际日常使用：`packs:bootstrap` + `packs:check` 两个
- 其余 9 个是 dead surface area

## 改造路线图（按 ROI 排序）

| ID | 动作 | 删行预估 | 难度 | 类别 |
|---|---|---:|---|---|
| **β** | 砍 pack 子系统：gstack 改为 `vendor/gstack/` 静态目录直接 cp，删 vendor-providers / pack-reports / pack-bootstrap | ~1500 | 🟡 中 | Installer |
| **A** | skills 扁平化：`domains/office/docx/` → `office-docx/`；root router 删；父 SKILL 拆纯文档 | 0（重组） | 🔴 大 | Skills，破坏性 |
| **γ** | gstack 三件套合并：1 份 install 逻辑 + host adapter 接口 | ~400 | 🟡 中 | Installer |
| **ζ** | backup 机制：`.sage-uninstall.js` 动态脚本 → 静态 manifest + idempotent restore | ~200 | 🟡 中 | Installer |
| **F** | 评估删 `run_skill.js`：5 个工具直接 bash 调用 vs 维护 dispatcher | ~800 | 🟡 中 | Skills |
| **α** | 拆 `bin/install.js` 1265 行 → 按生命周期分模块 | 0（重组） | 🟡 中 | Installer |
| **E** | office references 扁平化或外移 8 层 ooxml schemas | 仓库瘦身 | 🟡 中 | Skills |
| **B** | frontmatter 字段迁 `metadata:` 子键 | ~30 | 🟢 易 | Skills |
| **C** | description 重写：加英文 trigger keywords + "Do NOT use" 反触发 | +文本 | 🟡 中 | Skills |
| **η** | ccstatusline 解耦为可选 plugin/skill | ~80 | 🟢 易 | Installer |
| **D** | 删 `skills/SKILL.md` 根 router | ~40 | 🟢 易 | Skills |
| **ε** | 删 `target-registry.js` → 一行常量数组 | ~80 | 🟢 易 | Installer |
| **θ** | 命名去人格化：`.sage-backup` → `.code-abyss-backup` | ~30 | 🟢 易 | Installer |
| **δ** | 接 Claude Plugin Marketplace（保留 npm 通道） | +50 净增 | 🟢 易 | Installer |
| **P7** | skill name 改 gerund 形式（`processing-pdfs` 等） | 0（重命名） | 🟢 易 | Skills |
| **P8** | office 类 SKILL.md 精简或拆分（接近 500 行上限） | 文本压缩 | 🟡 中 | Skills |
| **P17** | 删 9 个无用 `packs:*` npm script | ~100 | 🟢 易 | Installer |

**理想终态预估**：
- bin/ 从 5364 LOC → ~2500–3000 LOC（**减 40–50%**）
- test/ 同比例缩减
- spec 合规度从 ~50% → 90%+
- 接入 marketplace 后跨 host 分发成本下降一个数量级

## Scope 决策矩阵

### Scope-S（小修缝合，v2.2.0 minor）

包含：B + C + D

- 范围：纯 skills 文本层调整，路径不变、产物不变
- 工作量：~1 周
- 风险：极低
- 影响：spec 合规度 50% → 75%，路由命中率 ↑

### Scope-M（中修瘦身，v2.3.0 minor）

包含：S + α + β + γ + η + ε + θ + P17

- 范围：installer 内部重构 + Scope-S；路径不变、target 行为不变、CLI surface 仅瘦不破
- 工作量：~3 周
- 风险：中（动 installer 主链，需充实 smoke 测试）
- 影响：bin/ LOC 砍 40%；ccstatusline / pack 子系统去耦
- 注意：保留向后兼容（旧 `.sage-backup/` 路径需 migration 读取）

### Scope-L（v3.0 大重构）

包含：M + A + E + F + δ + ζ + P7 + P8

- 范围：skills 路径全变（破坏性）+ marketplace 接入 + backup 机制重做
- 工作量：~6–8 周
- 风险：高
- 影响：必须 v3.0.0 major 发布、需提供 migration guide、旧用户重装
- 收益：架构现代化、对齐生态、五年视野下的可维护性

## 风险评估

### 共同风险

- **现有 5 个 verify-* 工具的 CI 集成**：所有 scope 都需要保证 `npm test` + `npm run verify:skills` + 4-target smoke install/uninstall 持续绿
- **NPM 用户**：v2.1.x 已发布，任何分发机制变更必须保证 `npx code-abyss --target ...` 入口不破

### Scope-L 特有风险

- **用户文件路径迁移**：`~/.claude/skills/domains/...` → `~/.claude/skills/<flat>/`，需 uninstall 旧版 + install 新版
- **第三方文档引用**：README、CHANGELOG、对外 PR 引用的 skill 路径全要 grep 替换
- **Plugin Marketplace 接入测试**：marketplace 在 macOS/Windows 上的 lifecycle 是否一致需 smoke

### 缓解策略

- 重构期间另开 `refactor/v3-*` 分支，main 保持 v2.x bugfix 通道
- 每 scope 拆 ≤5 个独立 PR，单 PR 不超过 ~500 LOC 改动面
- 每 PR 必须带：单元测试 + smoke 测试 + CHANGELOG 条目 + （Scope-L 独有）migration note

## 参考

- [Agent Skills 官方 overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [agentskills.io specification](https://agentskills.io/specification)
- [obra/superpowers](https://github.com/obra/superpowers) — 社区头牌 skills 集合，flat + plugin marketplace
- [anthropics/skills](https://github.com/anthropics/skills) — 官方示例 repo，flat + plugin marketplace
- 本项目 `CHANGELOG.md` v2.0.0–v2.1.11 演进历史

## 历史

- 2026-05-16：本 ADR 初版提交，决策位待 telagod scope 选择
- 2026-05-16：telagod 选定 Scope-L（v3.0 大重构），状态由 proposed → accepted；新增 5 阶段 Phase 路线图
