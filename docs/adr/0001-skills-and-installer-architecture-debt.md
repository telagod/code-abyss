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

### Phase 1 实际成果（2026-05-16，retrospective）

Phase 1 实际产出 **9 个 commit / 7 个 sub-PR**，全程 `main` 保持可发布、4-target smoke 全绿、零回归。

| Sub-PR | 动作 | 实际结果 | LOC 变动 |
|---|---|---|---:|
| α-1 | 抽 UI 层 → `bin/lib/ui/` | install.js -160 | +331 / -170 |
| α-2 | 抽 uninstall lifecycle | install.js -47 | +226 / -62 |
| α-3a | 抽 command-generation 纯函数 | install.js -123 | +337 / -135 |
| α-3b | 抽 install-helpers | install.js -39 | +278 / -57 |
| α-3c | 抽 installCore + side-effect installs | install.js -329 | +387 / -351 |
| α-4 | 抽 select + finish flows | install.js -161 | +273 / -196 |
| **α 小计** | install.js 拆分完成 | **install.js 1265 → 406 LOC（-67.9%）** | — |
| P17 | 删 7 个低频 npm script | -7 个 alias | +13 / -20 |
| η | ccstatusline 解耦到 `bin/optional/` + schema guard | 防 v2.1.11 类回归 | +256 / -88 |
| γ-a | gstack 三件套 → `bin/lib/gstack/` 统一架构 | DRY，新增 host 成本 -65% | +876 / -624 |
| γ-b | OpenClaw gstack 支持 | 4 host 完整覆盖 | +235 / -2 |
| β-1 | pack-docs 合并到 pack-bootstrap | 删冗余文件 | +59 / -65 |
| β-2 | 删 archive + local-dir 内建 provider | -2 个未用 provider | +47 / -140 |

**Phase 1 累计 LOC**：+2818 / -1910，**净 +908 LOC**（含约 1100 LOC 新增测试）。

**与 ADR 初版预估的差异（诚实记录）**：

- **α** 预估"install.js 拆解"：✅ 完全达成，-67.9% 与预期一致
- **β** 预估"-1500 LOC 大杀刀"：⚠️ **高估**。实际深入调研后只删了 -198 LOC：
  - pack-docs.js 仅 1 个内部消费者，可合并（-5）
  - vendor-providers 内建 archive/local-dir 0 真实消费者，可删（-93）
  - 但 **pack-registry / pack-vendor / pack-reports / pack-bootstrap / packs.js 都有真实消费者**（CI、用户脚本、bootstrap 流程），不能删
  - 教训：ADR 当初的 1500 LOC 数字是"不删 pack-registry 也不行"的乐观估计，没核对消费者
- **γ** 预估"~400 LOC 删除"：⚠️ **统计口径错**。实际是**架构升级而非减肥**：
  - 净 +252 LOC（core + 4 strategy + facade）
  - 真实价值在"加新 host 成本从 ~350 LOC 降到 ~120 LOC"，是 DRY 收益不是 LOC 收益
  - γ-b 顺带补齐 OpenClaw gstack 支持
- **ε** 预估"删 target-registry 81 LOC → 一行常量"：❌ **撤刀**。调研后发现：
  - target-registry 有 5 个外部消费者（不是 ADR 说的"只有 install.js 一家"）
  - INSTALL_TARGETS 含 label/actionLabel/homeDir 等 UI 元数据，不是简单字符串数组
  - MANAGED_ROOTS 含 'agents' 这个非-target root（codex 用 ~/.agents/skills）
  - 真删会破坏 codex 安装；保留比删值得
- **η** 预估"~80 LOC 解耦"：✅ + 顺手加 schema guard 防 v2.1.11 ZodError 类回归
- **P17** 预估"~100 LOC 删 9 个 script"：⚠️ **保守化**。实际删 7 个 alias（保留 4 个 CI/bootstrap 依赖项），bin/packs.js 子命令完整保留可被 `node bin/packs.js xxx` 调用

**Phase 1 完成度对原始 ADR**：α/η/γ/P17 ✅；β 砍量大幅缩水（-198 vs ADR -1500）但路径正确；ε 撤刀。**实际可发布 v3.0.0-alpha.1**。

### 迁移策略（2026-05-16 决策）

**旧路径处理**：v3.0 install 时检测 `~/.{target}/skills/domains/...` 旧路径仅打 warning，要求用户先 `--uninstall` 旧版再装新版。**不做自动迁移**。理由：
- 自动迁移需为 Phase 2 backup 机制额外加 migration 分支，复杂度不对称
- v3.0 是 major 版本，用户对破坏性变更有心理预期
- README + CHANGELOG.BREAKING 提供明确指引足够

**Phase 1 起手点**：α 拆 `install.js`。理由：
- god object 是所有后续重构的瓶颈（β/γ/ε/η 都要回头改 install.js）
- 先拆完 install.js，后续动作的改动面会显著缩小
- ROI 最高，但 review 复杂度也最高，先做掉化解最大未知数

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
- 2026-05-16：Phase 1 完成（9 commits / 7 sub-PR），追加 retrospective 段；ε 撤刀、β 砍量从 -1500 修正为 -198；准备发 v3.0.0-alpha.1
- 2026-05-16：Phase 2 完成（2 commits / 2 sub-PR）。ζ-1 提取 uninstall-core 共享逻辑 + idempotent 化；θ `.sage-*` 全量重命名 + 自动迁移。ζ-2 调研后取消（manifest 真 dead 字段仅 timestamp/persona 两个，ROI 太低；style/project_packs/optional_policy 被 finish.js 展示层使用）。准备发 v3.0.0-alpha.2

### Phase 2 实际成果（2026-05-16，retrospective）

| Sub-PR | 动作 | 实际结果 | LOC 变动 |
|---|---|---|---:|
| ζ-1 | 提取 `bin/lib/uninstall-core.js` + idempotent | 双次卸载不报错；`bin/uninstall.js` ↔ `lib/lifecycle/uninstall.js` 共享 STATUS/readManifestSafe；保留独立运行能力 | +510 / -85 |
| θ | `.sage-*` → `.code-abyss-*` 全量重命名 + 自动迁移 | 23 文件改动；老用户透明迁移（v2.x `.sage-backup` 装的目录 v3 install 时自动 rename）；CI smoke 8 处断言更新 | +100 / -64 |
| ζ-2 | manifest 字段瘦身 | **取消**。调研后发现真 dead 仅 timestamp+persona，可删 LOC ~10；其他 3 字段（style/project_packs/optional_policy）被 finish.js 展示层使用 | 0 |

**Phase 2 累计 LOC**：+610 / -149，**净 +461 LOC**（含 ~250 LOC 新测试）。

**与 ADR 初版预估的差异**：

- **ζ** 预估"~200 LOC + idempotent 重做"：✅ ζ-1 实际 +85（核心逻辑提取） + 21 个新测试覆盖 idempotent 场景
- **θ** 预估"~30 LOC 命名"：⚠️ 实际 +100（含自动迁移逻辑 + uninstall 双路径兼容 + 23 文件全量替换 + CI 断言）
- **ζ-2 manifest 瘦身**：❌ 取消。调研发现 `style` / `project_packs` / `optional_policy` 实际被 `bin/lib/lifecycle/finish.js` 用作安装总结展示，删了会破坏用户体验；`manifest_version` schema 留给未来 v3 升级窗口。仅 `timestamp` + `persona` 真 dead，2 个字段不值得单开 PR。

**Phase 2 完成度对原始 ADR**：ζ ✅；θ ✅；ζ-2 撤刀（数据不支持）。**实际可发布 v3.0.0-alpha.2**。

新能力：
- 重复 `npx code-abyss --uninstall <tgt>` 不报错（idempotent）
- v2.x 用户升级到 v3 时自动迁移 `.sage-backup` → `.code-abyss-backup`，无需手动干预
- 卸载流程同时清理新旧两套 uninstall 脚本

- 2026-05-16：Phase 3 完成（2 commits / 2 sub-PR）。α 全量扁平化 + gerund 改名；β frontmatter 瘦身。ooxml 移位取消（Python package import 兼容性风险）。准备发 v3.0.0-beta.1

### Phase 3 实际成果（2026-05-16，retrospective）

| Sub-PR | 动作 | 实际结果 | LOC 变动 |
|---|---|---|---:|
| α | 全量扁平化 + gerund 改名 | 22 leaf skill 平铺；11 router 删；47 knowledge .md 归入 references/；slug 全改 gerund；category 改按 runtimeType 推断；shared lib 移到 _lib/；openai.yaml + CI + 文档 + persona 路由表全更新 | +446 / -395 |
| β | frontmatter 瘦身 | 删 22 处 disable-model-invocation: false + 22 处 license: MIT | +0 / -44 |

**Phase 3 累计 LOC**：+446 / -439，**净 +7 LOC**。

**与 ADR 初版预估的差异（诚实记录）**：

- **A（扁平化）** 预估"0（重组）"：✅ 实际净 +7 LOC，基本 0 增长，248 文件改动但都是路径/名称变更
- **D（删根 router）** 预估"~40 LOC"：✅ 含在 α 内，11 个 router 一次清完
- **P7（gerund 改名）** 预估"0（重命名）"：✅ 含在 α 内，22 个 slug 全改
- **E（ooxml 外移）** 预估"仓库瘦身"：❌ **撤刀**。调研发现：
  - docx/pptx 两棵 ooxml 完全一致（47 文件零 diff），冗余但安全
  - Python `from ooxml.scripts.pack import pack_document` 是 package-level import，改目录名会断
  - 移位需改 Python import 路径 + SKILL.md 中的相对路径，对上游 anthropics/skills 兼容性风险大
  - 留作 Phase 4 技术债（可通过 symlink 或 Python path 重写解决，但不在本 PR scope）
- **B（frontmatter 迁 metadata 子键）** 部分完成：
  - ✅ 删 disable-model-invocation（dead code）和 license（移到顶层 LICENSE）
  - ⚠️ compatibility: node>=18 保留（5 个 scripted skill，有信息价值且 registry 不校验）
  - Phase 4 description 重写时可选择把 compatibility 迁入 body 或 metadata: 子键
- **F（评估删 run_skill.js）** 推迟到 Phase 4——先完成 description 重写，再评估 dispatcher 还有无存在价值

**Phase 3 完成度对原始 ADR**：A/D/P7 ✅；B 部分✅；E 撤刀；F 推迟。**实际可发布 v3.0.0-beta.1**。

新能力：
- skills 全 flat，零嵌套，对齐 obra/superpowers + anthropics/skills 主流结构
- gerund 命名对齐 spec 推荐（checking-code-quality, analyzing-security, etc.）
- category 推断不再依赖路径前缀，按 runtimeType 自动判定
- 47 个 domain knowledge .md 归入对应 leaf skill 的 references/，spec self-contained

- 2026-05-16：Phase 4 完成（1 commit / 1 sub-PR）。α description 重写为英文第三人称。β office 精简取消（全部 < 500 行已合规）。F run_skill.js 评估结论：保留（scripted skill 唯一运行时入口，148 LOC / 5 工具，ROI 合理）。准备发 v3.0.0-beta.2

### Phase 4 实际成果（2026-05-16，retrospective）

| Sub-PR | 动作 | 实际结果 | LOC 变动 |
|---|---|---|---:|
| α | description 重写 | 22 个 SKILL.md description 全改英文第三人称 + trigger keywords + anti-trigger；平均 245 字符 | +92 / -92 |
| β | office SKILL.md 精简 | **取消**。所有 22 个 SKILL.md 均在 spec 500 行限制内（最大 pptx 485 行） | 0 |

**Phase 4 累计 LOC**：+92 / -92，**净 0 LOC**。

**与 ADR 初版预估的差异**：

- **C（description 重写）** 预估"+文本"：✅ 完成。22 个全改英文，加 trigger + anti-trigger
- **P8（office 精简）** 预估"文本压缩"：❌ **取消**。实际行数均在 spec 限制内（pptx 485 < 500）
- **F（评估删 run_skill.js）** 预估"~800 LOC"：❌ **保留**。run_skill.js (148 LOC) 是 scripted skill 唯一运行时入口，被 Claude commands、Codex openai.yaml、CI 引用；删了 5 个 verify/gen 工具无法从 commands 调起

**Phase 4 完成度对原始 ADR**：C ✅；P8 取消（已合规）；F 保留（有消费者）。**实际可发布 v3.0.0-beta.2**。
