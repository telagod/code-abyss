# DESIGN — mythos 内核合并到 code-abyss 多 host 分发

> Status: **Draft v1（待评审）** · Direction: **C（合并，mythos 当内核 + 全 9 bundle）**
> 作者：设计探查基于对 `mythos` 与 `code-abyss` 两仓的深度审查（含 `file:line` 落点）。
> 本文是实施前的架构决策文档，不含代码改动。

---

## 0. 一句话论旨

**mythos 提供判断与纪律的脊椎，code-abyss 提供执行深度、多-host 分发与可选声音皮肤。合并后：mythos 的 9 bundle 成为 code-abyss 的纪律内核，骑在 code-abyss 现成的 skill 分发机器上，分发到 Claude / Codex / Gemini / OpenClaw 四个 host；命名声音降级为残余决策空间内的可选皮肤。**

两者不是替代关系，而是各补对方的短板：

| | mythos 有、code-abyss 缺 | code-abyss 有、mythos 缺 |
|---|---|---|
| | 可证伪（tradeoff→choice→可观察差异） | 4-host 分发机器（npm、adapters、packs） |
| | 优先级/边界架构（forbidden zone） | 30 个执行 skill 的领域深度 |
| | 测量闸门（行为电池 + 反谄媚回归） | macro 声音层（跨组合零漂移） |
| | 确定性 Stop-hook 兜底 | 可移植性（Character Card V2 转换） |
| | 防腐生命周期（earn/prune/cap/git 传记） | 静态注入退化档（OpenClaw） |

---

## 1. 背景与现状

### 1.1 mythos 是什么
Claude Code 的 9 个 skill bundle（Markdown 规则文档，无 runtime）：`doctrine`（治理/委派/done-gate）、`methods`（调查/设计/验证）、`character`（人格=决策策略）、`loop-engineering`（会话周期）、`frontend`/`backend`/`hardware`/`ml`/`security`（领域判断）。经 `install.sh` symlink 进 `~/.claude/skills/` + 把 `router-CLAUDE.md` 追加进 `~/.claude/CLAUDE.md`。规则用英文（弱模型遵从率），人类文档中文。带一个确定性 Stop-hook（`character/hooks/check_banned_openers.py`）。

**核心哲学**：人格 = 规则用尽时在残余空间的决策策略；每条规则必须指向可观察输出差异（不改输出即删）；从属于正确性/安全；有测量闸门与自我修剪生命周期；刻意**无名字/无声音/无背景**（研究证明 identity 属性降智 70%+、持久化用户画像放大谄媚 +45%）。

### 1.2 code-abyss 是什么
多-host 安装器/CLI（npm `code-abyss`，v4.9）。把 identity/behavior/style 三层经 `renderRuntimeGuidance()`（`bin/lib/style-registry.js:300-332`）装配成静态文件写进各 host。已有：
- **30 个执行 skill**（`skills/*/SKILL.md`，gerund 命名），覆盖 security(7)/backend(6)/docs(5)/quality-process(7)/hardware(3)/frontend(3)/ml(2)/其他。
- **`_shared/` 行为引擎**（8 文件，`style-registry.js:19-40` 定序装配）：`iron-laws` / `proactive` / `execution-drive` / `execution-chains` / `skill-routing` / `big-picture` / `injection-awareness` / `environment`。
- **6 命名 persona + 6 output-style**（声音皮肤，macro 模板 `{{self}}/{{user}}/{{language}}`）。
- **skill 分发机器**（见 §3）与 **hook 注入**（仅 SessionStart + PreToolUse，`--with-hooks` 门控）。

---

## 2. 合并的核心洞察：和解，不是叠加

mythos 9 bundle 与 code-abyss 现有资产**大量重叠**。合并的本质是把两套东西对齐成**分工明确的四层**，而非把 9 个文件塞进去。

### 2.1 重叠图（决定每个 bundle 是 replace / compose / import）

| mythos bundle | code-abyss 现状 | 合并动作 |
|---|---|---|
| **doctrine** | `_shared/iron-laws.md` + `_shared/environment.md`(收口=done-gate)；**无委派/subagent 纪律** | **REPLACE + IMPORT**：mythos doctrine 取代浅版；委派纪律是净空白，直接引入 |
| **methods** | `_shared/execution-chains.md` + `_shared/big-picture.md`（浅链） | **REPLACE**：mythos methods 是深版，取代 ~20 行 canned chain |
| **character** | `_shared/execution-drive`+`proactive` + 整个 `config/personas/*` + `cultivating-personas` | **COMPOSE**：mythos character 当 tie-break 决策内核；code-abyss persona 系统降级为声音皮肤，受 character 优先级约束 |
| **loop-engineering** | 无 `_shared` 对应；近似 `shipping-changes` skill | **IMPORT**：净空白，直接引入会话周期层 |
| **frontend** | `applying-ui-design-system` + `developing-mobile-apps` | **COMPOSE**：mythos 判断层坐在执行 skill 上（补通用 web 前端判断） |
| **backend** | 6 个深度 skill | **COMPOSE**：mythos "选什么栈/怎么判断" 路由进 code-abyss "具体怎么做" |
| **hardware** | `designing-hardware-products` + `operating-kicad-eda` | **COMPOSE**：判断层 → 执行 skill |
| **ml** | `building-agent-systems`（仅 agent）；**无经典 ML/eval 纪律** | **COMPOSE + IMPORT**：agent 部分 compose，训练/eval 纪律是空白引入 |
| **security** | 6 个 skill + `injection-awareness.md`（最深领域） | **COMPOSE**：mythos 威胁建模/授权 gate 判断层 → code-abyss 执行 skill |

**净结论**：纯空白引入 = `loop-engineering`、doctrine 的委派半、ml 的 eval 纪律。强重叠需 mythos 覆盖/命名空间 = character / backend / hardware / security。互补 = methods / frontend。

### 2.2 合并后的四层架构

```
┌─────────────────────────────────────────────────────────────┐
│  L-KERNEL  mythos 纪律脊椎                                     │
│   doctrine · methods · character · loop-engineering           │  ← REPLACE code-abyss _shared/ 浅版
│   （可证伪 · 优先级边界 · 测量闸门 · 生命周期）                 │
├─────────────────────────────────────────────────────────────┤
│  L-JUDGE   mythos 领域判断                                     │
│   frontend · backend · hardware · ml · security               │  ← COMPOSE：判断路由进执行
│   （选什么/怎么判断 → 路由到 ↓）                               │
├─────────────────────────────────────────────────────────────┤
│  L-EXEC    code-abyss 30 执行 skill                            │  ← 保留：怎么具体做
│   （K8s/Airflow/KiCad/pentest 的实操深度）                     │
├─────────────────────────────────────────────────────────────┤
│  L-SKIN    code-abyss 声音皮肤（可选）                         │  ← 降级：仅残余空间生效
│   personas + output-styles（macro 声音）                      │
├─────────────────────────────────────────────────────────────┤
│  L-DIST    code-abyss 分发机器                                 │  ← 载体：把上面全部送到 4 host
│   adapters(claude/codex/gemini/openclaw) + hooks + packs      │
└─────────────────────────────────────────────────────────────┘
```

各项目各扬所长：mythos = 判断/纪律，code-abyss = 执行 + 分发 + 声音。

---

## 3. 三个必须解决的硬张力

### T1 — 懒加载 vs 全量烘焙（哲学冲突）
mythos 立身之本 = 决策时刻现读、小 bundle 保遵从率、~120 行硬上限（`growth.md:44-50`）。code-abyss = 把所有层拼成静态大文件（`style-registry.js:328`）。**直接把 9 bundle 全量拼进 CLAUDE.md 会造出永远在线的巨块，恰好违反 mythos 自己的遵从率原则。**

**解**：按 host 能力分档，优先保留路由懒加载。好消息——**code-abyss 已经有路由分发机器**（§3.1），mythos bundle 本就是 SKILL.md 形态，天然适配：
- **Claude / Gemini / Codex**：mythos bundle 作为 skill 安装，SKILL.md 自调用/路由懒加载（保留 mythos 原意）。只有 router（≈20 行）+ 各 bundle 的 SKILL.md 常驻，规则体按需读。
- **OpenClaw**：无路由机制，只能静态注入 → 只烘焙 **router + 9 个 SKILL.md 摘要**（非全部规则体），规则体留盘由模型按需读；并按 mythos "no silent caps" **打日志声明本 host 未启用懒加载/hook**。

### T2 — host 能力不均（分发/执行/兜底都要分档）
| host | skill 机制 | 路由文件 | hook 事件 | 内核档位 |
|---|---|---|---|---|
| Claude | 原生 | `commands/*.md` | settings.json（有 SessionStart/PreToolUse，**无 Stop**） | **满档**：skill 懒加载 + Stop-hook 兜底 |
| Codex | 原生 skills-only | 无（原生发现） | config.toml `[[hooks]]` | **满档**：skill + hook 兜底 |
| Gemini | 原生 | `commands/*.toml` | settings.json（SessionStart/BeforeTool） | **中档**：skill 懒加载 + 无 Stop → 仅 prompt |
| OpenClaw | 无（静态 AGENTS.md+SOUL.md） | 无 | 插件模板，未接 core-install | **低档**：静态注入 + 无 hook，打日志声明 |

分发路径落点：`bin/lib/lifecycle/core-install.js`（Claude `:337`、Gemini `:383`、Codex `:359-380`、OpenClaw `:406-447`）；路由生成 `bin/lib/command-generation.js:59-73/108-139`。

### T3 — 单一真源（防止内核双份漂移）
两项目都信奉 single-source-of-truth。合并后 mythos 内核不得 fork 复制进 code-abyss。

**解**：code-abyss 把 mythos 作为**依赖 vendored**——推荐 git submodule（`vendor/mythos`）或构建期 sync 脚本（`scripts/sync-mythos.js` 从 mythos 仓拉最新 bundle 进 `skills/_kernel/`）。安装时从 vendored 副本读取。mythos 仓保持唯一编辑源；code-abyss 只消费。（附带修掉现有漂移：`_shared/skill-routing.md` 已引用不存在的 skill 如 `building-ai-systems`——合并时路由改由 mythos router 驱动。）

---

## 4. 优先级架构（安全脊椎，最重要）

合并把 code-abyss 从"persona 渗透到一切"改为"声音只在残余空间"。这是让 mythos 反-声音哲学与 code-abyss 声音产品**共存**的唯一机制。

**规则**（移植 mythos forbidden-zone，落 `_shared/iron-laws.md` 已有 `correctness>efficiency>security` 之上加边界头 + 装配顺序 `style-registry.js:328` 让 L-KERNEL 压过 L-SKIN）：

> 正确性、安全决策、verify done-gate、数据丢失防护 **永不由声音/persona 决定**。L-SKIN 仅在 L-KERNEL 判定为"平局/残余空间"时影响输出（措辞、语气、称谓），绝不覆盖内核结论。

**关键张力显式声明**：mythos 研究表明 identity 属性降智 70%+、用户画像放大谄媚 +45%；code-abyss 卖点恰是命名声音。**优先级架构就是二者共存的边界**——声音是皮肤，不进决策。若某 persona 的 scenario 优先级与内核冲突，内核胜。

---

## 5. 强制执行：Stop-hook 兜底（净新增能力）

mythos 的洞察：**prompt 禁令打不过训练出的谄媚反射**（cite claude-code #6120），故用确定性 Stop-hook 兜底。**code-abyss 现在全仓无任何 Stop hook**（只有 SessionStart + PreToolUse/BeforeTool），这是最实的能力缺口。

**设计**：移植 `check_banned_openers.py` 为 per-host 兜底，按 T2 分档：
- Claude：`injectClaudeHooks`（`abyss-integration.js:67-87`）新增 `Stop` 事件项。
- Codex：`injectCodexAbyssIntegration`（`codex.js:511-567`）新增 `[[hooks.Stop]]`。
- Gemini/OpenClaw：无 Stop → 仅 prompt 层，**打日志声明未强制**。

现有 per-host hook 形态模板已在 `skills/indexing-code/hooks/{claude,codex,gemini,openclaw}/` —— 自然插入点。注入器目前硬编码两事件，需各加一个事件项。幂等 marker 复用 `HOOK_MARKER`（`abyss-integration.js:42`）。

---

## 6. 测量闸门：让 "validated" 名副其实

code-abyss 现在的"36 组合 validated"只是数量断言，无行为验证。移植 mythos 行为电池（`growth.md:24-33`）：

- **~16 例行为电池**：测每个 persona×style 仍产出内核声明的优先级（正确性>声音）、跨 ~8 干扰轮不塌成谄媚（探测指令漂移）、Stop-hook 兜底触发正确。
- **Score choices, not self-report**：打分选择分布 vs baseline，不看模型自述。
- 落点：`skills/cultivating-personas/`（已有验证 gate）+ 让 loader 真正消费 `persona-card.json` scenarios（`style-registry.js:64-85`）杀掉 card↔md 双源漂移。

---

## 7. 分阶段路线（依赖排序，价值前置，带落点）

| Phase | 内容 | 主要落点 | gate |
|---|---|---|---|
| **P0** | vendoring 机制（submodule vs sync）+ 内核目录约定 `skills/_kernel/` + router 融合设计 | `scripts/sync-mythos.js` / `.gitmodules` | 定了才动其余 |
| **P1** | 优先级架构（forbidden zone）——最高安全性价比、最小 | `_shared/iron-laws.md`、`style-registry.js:328` | 独立可交付 |
| **P2** | Claude 端端到端参考实现：9 bundle 作 skill 安装 + router 融合 + Stop-hook 兜底 | `bin/adapters/claude.js:27,92`、`core-install.js:337,469`、`command-generation.js:59-73` | 满档验证 |
| **P3** | 扩到 Codex（第二满档 host） | `bin/adapters/codex.js:14`、`codex.js:511-567` | |
| **P4** | Gemini 中档（skill 懒加载，无 Stop）+ OpenClaw 低档（静态摘要 + 日志声明） | `core-install.js:383,406-447` | 显式记录降级 |
| **P5** | 测量闸门 + 防腐：行为电池、修 card↔md 漂移、DESIGN 陈旧、loader 消费 card scenarios、`_shared/skill-routing.md` 改 mythos-router 驱动 | `skills/cultivating-personas/`、`style-registry.js:64-85` | "validated" 落地 |

L-JUDGE×L-EXEC 的 compose（领域判断路由进执行 skill）跨 P2–P4 随各 host 铺开：mythos domain SKILL.md 的 routing 段指向 code-abyss 对应执行 skill 名。

---

## 8. 非目标（反镀金，显式不做）

- **不**重写 code-abyss 的 30 个执行 skill——它们是 L-EXEC 深度资产，mythos 判断层坐在其上，不取代。
- **不**剥离命名声音 persona——那是产品，降级为皮肤即可（这也是为何选 C 而非 B）。
- **不**把 mythos 规则翻译成中文——内核英文（弱模型遵从率），声音中文，本就是不同层。
- **不**给不支持的 host 硬造 skill/hook 机制——按能力分档 + 打日志声明，不假装满档。
- **不**在 P1 之前动任何分发代码——优先级边界是安全前提。

---

## 9. 待你拍板的开放决策

1. **vendoring 机制**：git submodule（`vendor/mythos`，强一致但 clone 需 `--recursive`）vs 构建期 sync 脚本（松耦合，可能滞后）？倾向 submodule。
2. **router 融合**：mythos router 与 code-abyss 现有 `_shared/skill-routing.md` 二选一合并，还是分层（mythos router 管 9 内核 bundle，code-abyss routing 管 30 执行 skill）？倾向分层。
3. **内核目录名**：`skills/_kernel/`（与 30 执行 skill 平级隔离）可否？
4. **P1 是否先独立落地并合入**（优先级边界不依赖 vendoring，可先交付看形态）？

---

*本文档落点：`code-abyss/docs/design/mythos-kernel-merge.md`。评审通过后按 §7 分阶段实施，每 phase 独立 PR。*
