# Persona Architecture v2 — 重构提案

> 状态：**已收口** — P1/P2/P3/P4/P5 全部落地并通过全量测试；P6 经调研证伪，标记为「无需实施：已天然满足 lorebook 语义」（见 §6）。
> 关联：`config/personas/`、`output-styles/`、`bin/lib/style-registry.js`、`bin/lib/persona-converter.js`、`skills/cultivating-personas/`
> 对标：Character Card V2/V3 spec、SillyTavern Prompt Manager、类脑「制卡思路」

---

## 1. 一句话问题

当前人格系统按 **「身份 / 共享 / 风格」** 三分；而业界成熟方案（角色卡标准）按 **「注入位置 / 作用」** 分层。
拆分轴错位，导致 **人物定义（who）与提示词工程（how / 破限 / 格式锁）混在同一文件**，并衍生出一系列结构债。

---

## 2. 现状（v1）

### 2.1 组装链

`renderRuntimeGuidance(projectRoot, styleSlug, target, personaSlug)`（`bin/lib/style-registry.js`）：

```
identity = persona/<slug>.md            (全文，人称硬编码)
shared   = _shared/*.md  (固定 6 文件顺序拼接)
style    = output-styles/<style>.md     (仅此层做 {{self}}/{{user}}/{{language}} 替换)
return  identity + "\n\n" + shared + "\n\n" + style
```

### 2.2 数据源现状

| 信息 | 存放位置 | 备注 |
|------|---------|------|
| self / user / language | `personas/index.json` ＋ `persona/<slug>.md` 正文 ＋ `persona-card.json`.voice | **三处重复** |
| tone / register / emoji_policy | `persona-card.json`.voice | **运行时不消费** |
| scenarios / capabilities / conversation_starters | `persona-card.json` | **运行时不消费** |
| 人物性格 | `persona/<slug>.md`「性格层」 ＋ `output-styles/<style>.md`「话术特征」 | **两处重复** |
| 输出骨架 / 情绪锚点 | `output-styles/<style>.md` | format 与 voice 混装 |

> 注：`persona-card.json` 已声明 `identity` / `behavior` / `style` 三个分文件字段，
> 但这三个文件**从未落地**，运行时也不读取——分层意图早已埋下，只是未兑现。

---

## 3. 业界最佳实践（提炼）

| 原则 | 出处要点 |
|------|---------|
| **按注入位置分层** | SillyTavern Prompt Manager 流水线：`Main(System) → World Info → 角色描述 → 性格 → 场景 → 对话示例 → 聊天历史 → Author's Note(@depth) → Post-History`。每段是一个**职责**。 |
| **位置即权力 (Positional Bias)** | 上下文头尾权重最高。`post_history_instructions` 放最末，**优先级高于 main prompt，可覆盖之**。 |
| **who 与 how 分槽** | Character Card V2 引入 `system_prompt` + `post_history_instructions`，明确**取代「把破限塞进 description」的旧做法**。 |
| **对话示例 > 形容词** | "模型从 First Message / `mes_example` 学到的风格胜过任何其他字段"；Ali:Chat：**用对话强化特质，而非形容词堆砌**。 |
| **单一事实源** | "一条规则出现在三个地方，迟早自相矛盾。" |
| **按需注入 (Lorebook)** | 关键词触发动态注入，"能用绿灯（按需）就别用蓝灯（常驻），省 token"。 |
| **宏全局生效** | `{{char}}`/`{{user}}`/`{{persona}}` 在**所有字段**替换，不限某一层。 |

来源见文末 §10。

---

## 4. 现状 vs 最佳实践 — 差距台账

| # | 最佳实践 | v1 现状 | 实锤 |
|---|---------|--------|------|
| G1 | 按注入位置/作用分层 | 按身份/共享/风格分层 | 拆分轴错位 |
| G2 | who 与 how 分槽 | `abyss.md` 混装人物（角色锚定/性格）+ 魔法（预授权/CTF契约/秘典路由） | 单文件 78 行混装 |
| G3 | few-shot 范例锁语气 | **无对话示例**，全靠形容词 | `mes_example` 缺失 |
| G4 | 末尾 PHI 强指令位 | "不自称 AI" 写在 persona 开头，无末段再注入 | 位置偏见未利用 |
| G5 | 宏全局生效 | `{{self}}` 仅 style 层替换，persona 正文硬编码 | `elder-sister.md` "姐姐/小宝" 写死 12 次 |
| G6 | 单一事实源 | self/user/language 三处存储 | index.json + md正文 + card |
| G7 | 按需注入省 token | 全量静态注入 | issue #16 上下文爆炸 / #13 token 量大 根因 |

> **G5 是「假 N×N」的元凶**：persona 正文写死人称 → `abyss` persona 无法干净组合 `elder-sister-gentle` style，所谓 6×6 组合是幻觉，真实为 1:1 绑定。
> **G6 最可惜**：`persona-card.json` 已对标角色卡，但 `cardToPersonaEntry()` 只取 `voice.{self,user,language}` 三字段，其余富信息全丢。

---

## 5. 目标架构（v2）

### 5.1 五层（按作用/注入位置）

```
L0  引擎层  Engine / System        全角色共享，最先注入
    └ 铁律 / 执行链 / 技能路由 / 主动协议 / 大局观 / 环境
      （≈ 现 _shared/*.md，方向正确，保留）

L1  人物层  Character (who)         静态描述，全程用宏
    └ 身份 + 性格 + 世界观；只描述，不含行为指令
      （从 persona/<slug>.md 剥离出「纯人物」部分）

L2  范例层  Example Dialogue        few-shot，锁语气【新增】
    └ 每角色 2–3 轮范例对话（{{user}}/{{char}} 交替）

L3  契约层  Output Contract (format)
    └ 输出骨架（判词/斩链/验尸…）、长任务格式
      （现 output-styles 的「骨架」部分，去掉与 L1 重复的话术）

L4  强指令层 Post-History (PHI)     最末注入，最强权重【新增定位】
    └ 反 AI 腔 / 反 OOC / 格式锁 / 授权边界
```

组装顺序：`L0 → L1 → L2 → L3 → 〈harness 注入会话历史〉 → L4`
（L4 在 Claude Code 这类一次性 system 注入环境下，落在最终拼装串的末尾，承担「末段强指令」职责。）

### 5.2 字段映射：Character Card ↔ code-abyss v2

| CCv3 字段 | code-abyss v2 落点 | 说明 |
|-----------|-------------------|------|
| `name` / `nickname` | `voice` 衍生 / `display_name` | — |
| `description` | **L1 人物层** | 身份、背景、世界观 |
| `personality` | **L1 人物层** | 性格摘要（不再与 style 重复） |
| `scenario` | **L1 人物层** 或动态注入 | 情景剧本 |
| `mes_example` | **L2 范例层** | 新增 |
| `system_prompt` | **L0 + L4 拆分** | 通用引擎指令入 L0；角色级强指令入 L4 |
| `post_history_instructions` | **L4 强指令层** | 反 OOC / 格式锁 / 授权边界 |
| `character_book` (lorebook) | **秘典路由升级** | 「触发词→读秘典」已是雏形，补 token 经济 |
| `extensions` | `persona-card.json`.extensions | 保留 |

### 5.3 单一事实源

`persona-card.json`（升级对标 CCv3）成为唯一事实源：

```
voice         = { self, user, language, tone, register, emoji_policy }  ← 全部进运行时
description   → identity.md   (L1，兑现现有 card 已声明的分文件字段)
personality   → identity.md   (L1)
mes_example   → examples.md   (L2，新增)
post_history  → posthistory.md(L4，新增)
```

- `personas/index.json` 的 self/user/language **改为从 card 派生**（构建期生成，不再手维护），消除 G6。
- `persona/<slug>.md` 正文人称 **全部改宏** `{{self}}`/`{{user}}`，消除 G5。

### 5.4 运行时改造（renderRuntimeGuidance）

```js
// 伪代码 — v2
function renderRuntimeGuidance(root, styleSlug, target, personaSlug) {
  const card = loadCard(personaSlug);                 // 单一事实源
  const macros = card.data.voice;                     // self/user/language/tone/...

  const L0 = loadSharedBehavior(root);                // 不变
  const L1 = applyMacros(loadLayer(card, 'identity'), macros);
  const L2 = applyMacros(loadLayer(card, 'examples'), macros);   // 新增，可空
  const L3 = applyMacros(resolveStyleSkeleton(styleSlug), macros);
  const L4 = applyMacros(loadLayer(card, 'posthistory'), macros);// 新增，可空

  return [L0, L1, L2, L3, L4].filter(Boolean).join('\n\n') + '\n';
}
```

关键变化：`applyMacros` 作用于 **所有层**（不再仅 L3），且消费 voice 全字段。

---

## 6. 迁移路径（分阶段，可回滚）

| 阶段 | 动作 | 风险 | 状态 |
|------|------|------|-----------|
| **P0** | 本文档评审通过 | 无 | ✅ 完成 |
| **P1** | 宏替换扩展到全部 persona 层（`renderRuntimeGuidance` 内 `apply` 包裹 identity/examples/style/posthistory） | 低 | ✅ 完成 |
| **P2** | persona 正文人称改宏（6 角色全量，名号 `雨姐/大姐姐` 已保护） | 低 | ✅ 完成 |
| **P3** | 单一事实源：`index.json` 瘦身为启用清单 + default 指定；label/description/self/user/language 运行时从 `persona-card.json` 派生（`loadPersonaCard`）。新增两条护栏测试（index.json 不得含 voice 字段 + 派生值与 card 严格一致） | 中 | ✅ 完成 |
| **P4** | 新增 L2 范例层（6 角色各补 `examples.md` few-shot），消除 G3 | 低（纯增量） | ✅ 完成 |
| **P5** | 新增 L4 强指令层（6 角色各补 `posthistory.md`），反 AI 腔/格式锁/授权边界 | 中 | ✅ 完成 |
| **P6** | 秘典路由 → lorebook 化（按需注入），缓解 G7 | 高 | ❎ 原命题证伪（见 §6.1）；衍生出真问题「路由去重」并已处理（见 §6.2） |

**实测结论**：P1/P2/P4/P5 落地后，`npm test`（12 套件 / 148 测试 / 8 快照）与 `npm run verify:skills` 全绿；6 persona 渲染零宏泄漏、L2/L4 到位、名号无损。L2/L4 缺省时输出与 v1 逐字节等价。P3 已合入 main（PR #32），单一事实源生效。

### 6.1 P6 调研结论（命题证伪）

实施前调研发现 **P6 原命题不成立——秘典路由本身已是 lorebook**，无需「化」：

1. **已是指针式按需注入**：`abyss.md` 的「神通秘典路由」表仅 **447 字符**（常驻），6 个秘典文件共 **21,359 字符** 只在触发关键词时由 agent `Read` 加载——这正是 lorebook「绿灯按需」语义。
2. **常驻 token 大头不在它**：abyss 整体渲染 ~5,526 字符，L0 共享层占 ~3,422，秘典路由仅 447。移除它省不下多少，反而丢失攻防人格锚点（赤焰/破阵/验毒 等化身名属 voice）。
3. **绑定的 issue #16/#13 已 CLOSED 且原文迁移**，原始诉求不可考。

### 6.2 P6 衍生治理：persona↔skill 路由去重（已处理）

调研副产物揭出一处真实重复：`config/personas/abyss.md` 的秘典路由表曾硬编码 6 个 `references/*.md` 路径，与 `skills/securing-systems/SKILL.md` 的路由表指向相同文件、触发词高度重叠——**persona↔skill 跨层路由重复**（与 P3 治的双源同源）。

**处理**：abyss 路由表从「列文件路径」改为「化身 + 主司意图 + 触发词」，并加单一源指引——

```
> 路由落点（具体 references/*.md）以 skills/securing-systems/SKILL.md 为单一事实源。
```

- **voice 全保**：6 个化身名（🔥赤焰/🗡破阵/🔬验毒/💀噬魂/❄玄冰/👁天眼）与触发词原样保留，人格锚点不损。
- **重复清零**：`abyss.md` 不再出现任何 `references/*.md` 路径（grep 计数 6→0），securing-systems SKILL.md 成为路由落点唯一事实源，文件改名/迁移不再需要双改。
- **渲染验证**：abyss 渲染仍含全部化身名 + 单一源指引，零宏泄漏，self/user 正常。

> 建议先做 **P1 → P4**（低风险、立竿见影），P5/P6 视效果再推进。
> 每阶段以 `abyss` 单角色做 PoC，绿了再横推其余 5 角色。

---

## 7. 兼容性影响清单

牵动面（评审时逐项确认）：

- `bin/lib/style-registry.js` — 组装链重写（`renderRuntimeGuidance`、`applyPersonaVars`）
- `bin/lib/persona-converter.js` — `cardToPersonaEntry` 扩展消费字段；双向转换
- 四 target 生成 — Claude / Codex / Gemini / OpenClaw 的产物拼装均经 `renderRuntimeGuidance`，需回归
- `skills/cultivating-personas/` — 制卡产物结构变更（identity/examples/posthistory 分文件），`persona_forge.js` 校验同步
- `docs/specs/tech-persona-card-v1.0.md` + `persona-card.schema.json` — 升 v1.1 / 对标 CCv3 字段
- 测试 — `test/persona-converter.test.js`、`test/install-generation.test.js`、`test/install-registry.test.js`
- 站点 — `site/submit.html`、`site/i18n.js` 的投稿表单字段

---

## 8. 风险与回滚

- **风险**：组装链是四 target 公共路径，回归面大 → 用 P1–P5 分阶段、单角色 PoC 控制爆炸半径。
- **回滚**：每阶段独立 commit + 可单独 revert；v1 的 `persona/<slug>.md` 在 P1–P3 期间保持可用（宏化后仍是合法 markdown）。
- **数据迁移**：self/user/language 派生前先跑一致性校验（card vs index.json vs 正文三方比对），不一致即阻断。

---

## 9. 验收标准

- [ ] `renderRuntimeGuidance` 输出中无残留未替换 `{{...}}`（现状 style 层有 19 处依赖正确替换）
- [ ] self/user/language 仅一处可手维护（card），其余派生
- [ ] 每角色至少 2 轮 `mes_example`
- [ ] 「不自称 AI / 格式锁」出现在组装串末段（L4）
- [ ] `npm test` + `npm run verify:skills` 全绿
- [ ] 6 persona × N style 组合 smoke 无人格分裂（或显式声明 style 为可选 format override）

---

## 10. 来源

- SillyTavern Docs — Prompt Manager：https://docs.sillytavern.app/usage/prompts/prompt-manager/
- SillyTavern Docs — Prompts（Main / Post-History / World Info）：https://docs.sillytavern.app/usage/prompts/
- SillyTavern Docs — Character Design / Author's Note：https://docs.sillytavern.app/usage/core-concepts/characterdesign/ ，https://docs.sillytavern.app/usage/core-concepts/authors-note/
- Character Card Spec V2：https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md
- Character Card Spec V3：https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md
- V2 vs V3 迁移：https://tavernai.cards/blog/v2-vs-v3
- Ali:Chat 风格指南：https://rentry.co/alichat
- 类脑宝宝教程 — 一种通用制卡思路：https://down-3ud.pages.dev/leinao_about/make_card/
- SillyTavern 中文教程站 — 预设/世界书：https://guide.sillytavern.one/presets-lorebooks/
- 角色卡设计（单一事实源）：https://sillycard.xyz/blog/character-card-design
