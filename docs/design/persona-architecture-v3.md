# DESIGN — Persona Architecture v3：eager→lazy 反转

> Status: **Draft v1（待评审）**
> Supersedes: `docs/persona-architecture-v2.md`（v2 五层贪婪装配）并吸收 `docs/design/mythos-kernel-merge.md`（mythos 内核合并——在 v3 中它只是懒加载层的一部分）。
> 背景：mythos 内核合并（方向 C）落地 P0/P1/P2 后，暴露出 v2 架构的根本缺陷（常驻预算爆炸、双格式漂移、无强制/测量）。v3 是对这些缺陷的统一重设计，非增量补丁。

---

## 0. 一句话论旨

**把 v2 的「贪婪烘焙」反转为「懒加载」：常驻上下文只留极小核心（声音 + 精简 router + 优先级锚 + 安全底线），其余全部——mythos 纪律内核、code-abyss 行为引擎、领域判断——变成按 description/router 调用的 lazy skill。**

P0 已证明这条路通：9 内核 bundle + 30 exec skill 作为 skill 分发到 4 host、注册、生成路由，全部走通。v3 把这个机制变成主干，而非附加。

---

## 1. 缺陷诊断（为什么必须大改，非补丁）

| # | 缺陷 | 证据（file:line） | 后果 |
|---|---|---|---|
| 1 | **常驻装配贴死 8000 天花板** | `bin/lib/style-registry.js:329` 把 identity+shared(8文件)+examples+style+posthistory 拼成静态 blob；v4.9 最大 style 渲染 ~7900/8000 | 零 headroom；内核塞不进（本次预算测试爆炸的根因）；违反"别撑大常驻→全局遵从率下降" |
| 2 | **双格式漂移** | markdown identity（`config/personas/abyss.md:54-66` 场景表）vs `config/personas/abyss/persona-card.json:32-75` scenarios，手工双维护，已漂（8 vs 7） | card 的 `identity/behavior/style` 指针字段被 loader 忽略；两份真源冲突 |
| 3 | **无强制执行** | v2 纯静态注入，无 hook | 压力下静默退化（谄媚反射打赢 prose 禁令，claude-code#6120） |
| 4 | **无测量** | "36 validated combos" 仅数量断言 | 无行为验证；"validated" 名不副实 |
| 5 | **单体行为引擎** | 所有 persona 共享同一 `config/personas/_shared/*`（8 文件）+ abyss 烘死的 scenario 优先级 | 人格差异化仅靠薄 identity+style；gentle mentor 与 blunt overseer 同一铁律 |
| 6 | **全线陈旧漂移** | `_shared/skill-routing.md` 引用不存在的 skill（building-ai-systems）；DESIGN.md 停在 v2.0.2；abyss.md v5.0 vs scholar.md v3.0 | 维护腐化 |

**共同根源 = #1 的贪婪烘焙**：把一切塞进一个静态 always-on prompt。#2–#6 都是它的并发症或它掩盖的问题。

---

## 2. 目标架构：常驻极小核 + 懒加载层

```
┌───────────────────────────────────────────────────────────────┐
│  ALWAYS-ON CORE  常驻极小核（硬上限 ≤ 2,000 .length）          │
│   1. persona 声音（{{self}}/{{user}}/{{language}} macro）        │
│   2. 精简统一 router（→ 懒加载层的入口，~200 行内）             │
│   3. 优先级锚（内核 > 声音；正确性/安全/done-gate/数据丢失）    │
│   4. 安全底线（injection-awareness 的极小 always-on 部分）       │
│   5. output-style 契约（声音的格式骨架）                        │
├───────────────────────────────────────────────────────────────┤
│  LAZY SKILL LAYER  按 description/router 调用（不进常驻）        │
│   • mythos 纪律内核 9 bundle（doctrine/methods/character/        │
│     loop-eng/frontend/backend/hardware/ml/security）             │
│   • code-abyss 行为引擎有用部分（proactive/execution-drive/     │
│     big-picture/execution-chains → 迁进 character/methods/       │
│     loop-eng 内核；injection-awareness 详情 → 懒加载）           │
│   • 30 个 exec skill（不变）                                     │
├───────────────────────────────────────────────────────────────┤
│  SINGLE SOURCE  persona-card.json 唯一真源                       │
│   loader 真正消费 card；markdown identity 由 card 生成或废弃     │
├───────────────────────────────────────────────────────────────┤
│  ENFORCE + MEASURE                                               │
│   Stop-hook 强制执行（已做，claude+codex）+ 行为电池（R5）      │
├───────────────────────────────────────────────────────────────┤
│  DISTRIBUTION  4-host 适配器（机制不变，现在主要搬 skill 非 blob）│
└───────────────────────────────────────────────────────────────┘
```

### 2.1 always-on 硬预算契约（新）
新增/收紧测试：**always-on core（不含 lazy skill）必须 < 2,000 .length**。当前 8000 测试保留但会有巨大 headroom（因为常驻从 ~7900 降到 ~1500）。这把"别撑大常驻"从口号变成 CI 闸。

---

## 3. 逐文件迁移决策（`config/personas/_shared/*`）

| 现文件 | 大小(b) | v3 去向 | 理由 |
|---|---|---|---|
| `iron-laws.md` | 758 | **保留常驻**（+ 已加的 forbidden-zone） | 核心安全/优先级，每轮都要 |
| `injection-awareness.md` | 1927 | **拆**：极小 always-on 底线 + 详情懒加载 | 注入防御要常驻，但 1927b 太重 |
| `environment.md` | 409 | **保留常驻**（或并入 iron-laws） | 极小，收口契约 |
| `skill-routing.md` | 903 | **合并进精简统一 router** | 顺带修掉 dangling skill 引用 |
| `kernel-router.md`(P0) | — | **精简后作为统一 router** | 从 2405→~精简中文 |
| `proactive.md` | 1461 | **懒加载**（迁进 character 内核） | 被 mythos character 覆盖 |
| `execution-drive.md` | 2024 | **懒加载**（迁进 character 内核） | 同上 |
| `big-picture.md` | 371 | **删**（methods 内核替代） | REPLACE |
| `execution-chains.md` | 342 | **删**（methods 内核替代） | REPLACE |

常驻 `_shared` 从 8 文件 ~8k 字节降到 ~3 文件 + 薄 router，给声音/风格留出充足预算。迁走的行为内容不丢——在 lazy 内核 bundle 里，按需读。

---

## 4. 解掉本次暴露的 3 个债务

1. **预算测试爆炸** → 常驻极小核天然解决（§2.1）。
2. **`invocable skill 预期名单` + `扫描 skills 目录` 测试失败** → 根因是 sync 给内核 skill 注入了 `user-invocable: true`，冒出 9 个斜杠命令。**决策：内核 skill 应 `user-invocable: false`**——它们靠 router/description 自调用（mythos 原设计），不是 user 斜杠命令。改 `scripts/sync-mythos.js` 注入 `false`（skill-registry 只要求字段存在，false 合法），既满足契约又不生成噪音命令，且两个测试恢复绿。
3. **双格式漂移**（#2）→ loader 消费 `persona-card.json`（`style-registry.js:64-85` 已有 loadPersonaCard，扩展到消费 scenarios），markdown 场景表由 card 生成或废弃。

---

## 5. 迁移相位（每相独立可交付 + 收绿）

| 相 | 内容 | 落点 | 门 |
|---|---|---|---|
| **R0** | always-on 核心瘦身：移除 proactive/execution-drive/big-picture/execution-chains 出 `SHARED_FILES_ORDER`；injection-awareness 拆；router 精简统一 | `style-registry.js:19-28`、`_shared/*` | 预算测试绿（core<2k） |
| **R1** | 内核 skill `user-invocable:false`；修 2 个 skill-list 测试 | `scripts/sync-mythos.js`、test fixtures | 3 个红测试全绿 |
| **R2** | 迁移的行为内容并入内核 bundle（校验 character/methods 覆盖 proactive/execution-drive/chains 的要点） | mythos 上游 or overlay | 无行为丢失 |
| **R3** | 单一真源：loader 消费 persona-card.json scenarios；md 场景表生成/废弃 | `style-registry.js:64-85` | 无双源 |
| **R4** | 精简统一 router 收编 skill-routing（修 dangling 引用）+ domain compose 闸（已做 16 exec） | `_shared` router | 路由无死链 |
| **R5** | 测量：行为电池替换数量断言（每 persona×style 出内核优先级、跨干扰轮不塌谄媚） | `skills/cultivating-personas/` | validated 名副其实 |

已完成并入 v3 的：P1 forbidden-zone（常驻锚基础）、P2 Stop-hook 强制执行（claude+codex + 安装流程）、domain compose 闸（16 exec skill）。

---

## 6. 非目标（反镀金）

- **不**剥离命名声音 persona——那是产品；v3 让声音成为常驻核唯一的"人格"内容，纪律全懒加载。
- **不**重写 30 个 exec skill——它们是 L-EXEC 深度资产。
- **不**改 4-host 分发机制——它已能搬 skill；v3 只是让它主要搬 skill 而非 blob。
- **不**为不支持的 host 硬造能力——按能力分档 + 日志声明降级（no-silent-caps）。

---

## 7. 待你拍板的开放决策

1. **markdown identity 的命运**：card 生成 md（保留 md 作展示层）vs 直接废弃 md、loader 只读 card？倾向前者（渐进）。
2. **injection-awareness 拆分粒度**：always-on 留多少？倾向留 ~10 行核心检测模式，详情懒加载。
3. **R0 是否先独立落地**（它直接把当前分支 3 红收绿，不依赖 R2+）？倾向是。
4. **mythos 上游 vs overlay** 承接迁移的行为内容（R2）：改 mythos 源，还是 code-abyss overlay？

---

*落点 `code-abyss/docs/design/persona-architecture-v3.md`。评审通过后按 §5 分相实施，每相独立 PR 且收绿。旧的 mythos-kernel-merge.md 加 superseded 指针。*
