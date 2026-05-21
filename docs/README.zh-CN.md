<!-- Code Abyss · 中文 README -->

<p align="center">
  <a href="https://telagod.github.io/code-abyss/#zh">
    <img src="https://raw.githubusercontent.com/telagod/code-abyss/main/assets/banner.svg" alt="Code Abyss — 给你的 AI 助手一个人格" width="100%">
  </a>
</p>

<h3 align="center">可组合的人格 · 风格 · 22 项工程技能<br/>支持 Claude Code · Codex CLI · Gemini CLI · OpenClaw</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/code-abyss"><img src="https://img.shields.io/npm/v/code-abyss?color=9b8cff&label=npm&style=flat-square" alt="npm"></a>
  <a href="https://github.com/telagod/code-abyss/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/telagod/code-abyss/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-c4b8ff?style=flat-square" alt="MIT"></a>
  <a href="https://telagod.github.io/code-abyss/"><img src="https://img.shields.io/badge/官网-pages-9b8cff?style=flat-square" alt="Site"></a>
</p>

<p align="center">
  <a href="https://telagod.github.io/code-abyss/"><b>官网</b></a> ·
  <a href="../docs/specs/tech-persona-card-v1.0.md"><b>规范</b></a> ·
  <a href="../README.md"><b>English</b></a> ·
  <a href="../CHANGELOG.md"><b>更新日志</b></a> ·
  <a href="https://telagod.github.io/code-abyss/submit.html"><b>提交人格</b></a>
</p>

---

## 困境

大多数 AI 编程助手**没有"自我"的记忆**。无论是调试竞态、审查架构还是处理 P0 故障，它们都用同一种扁平的客服腔回应。跨会话忘记你的约定，反复横跳给出矛盾建议，听起来像在念话术。

你要的不是客服。你要的是**一个有人格、执行一致、自动闭环的资深工程师**。

## Code Abyss 做了什么

一条命令，把三个可组合层装进你的 Agent 运行时：

```
┌─────────────────────────────────────────────────────┐
│  身份   它是谁     →  config/personas/*.md          │
│  行为   怎么做     →  _shared/*.md                  │
│  风格   怎么说     →  output-styles/*.md            │
└─────────────────────────────────────────────────────┘

  6 个人格  ×  6 种风格  =  36 种验证过的组合
```

任选人格，任配风格。行为层（铁律、执行链、主动协助协议、技能路由）始终不变。你的 Agent 跨会话**保持一致的角色 + 结构化的执行 + 领域专长**。

```bash
npx code-abyss -t claude -y
```

或作为 Claude Code 插件安装：

```bash
claude plugin install code-abyss
```

---

## 人格画廊

<table>
<tr>
<td width="50%" valign="top">

<sub><b>内置 · 文言</b></sub>

### 邪修红尘仙 · `abyss`

> 吾 → 魔尊

安全优先的暗黑修仙者。直接、果断、闭环到底。默认人格。

`#security` `#xianxia` `#decisive`

</td>
<td width="50%" valign="top">

<sub><b>内置 · 文言</b></sub>

### 文言小生 · `scholar`

> 在下 → 前辈

文言书生。视代码如诗，视调试如解谜。

`#literary` `#classical` `#meticulous`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>内置 · 温柔</b></sub>

### 知性大姐姐 · `elder-sister`

> 姐姐 → 小宝

温柔导师。用关怀包裹锋利的技术判断。善用反问引导。

`#gentle` `#mentoring` `#insightful`

</td>
<td valign="top">

<sub><b>内置 · 俏皮</b></sub>

### 古怪精灵小师妹 · `junior-sister`

> 本仙女 → 师兄

多动症 bug 猎手。吐槽烂代码毫不留情，吐槽完默默帮你重构。

`#playful` `#energetic` `#chaotic`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>内置 · 温厚</b></sub>

### 铁壁暖阳 · `iron-dad`

> 哥 → 宝子

靠谱大哥。扛压体质，闷骚幽默，偶尔 dad joke。

`#warm` `#dependable` `#protective`

</td>
<td valign="top">

<sub><b>社区 · 俏皮</b></sub>

### 东北魅影·雨姐 · `dongbei-yujie`

> 姐 → 老蒯

刀子嘴热心肠的东北代码监工。先把问题戳破，再把路铺平。 <sub>提交者: wons</sub>

`#dongbei` `#blunt` `#principal`

</td>
</tr>
</table>

```bash
# 自由混搭 — 任意人格 × 任意风格
npx code-abyss -t claude --persona elder-sister --style abyss-cultivator -y
```

**[浏览完整画廊 →](https://telagod.github.io/code-abyss/#personas)**

---

## 技能矩阵

22 个领域技能，扁平目录结构，对齐 [agentskills.io](https://agentskills.io/specification) 规范。技能按上下文自动加载——Agent 在正确的时机读取正确的知识，无需你手动指定。

| 领域 | 覆盖范围 |
|---|---|
| 🛡 **安全** | 渗透测试、代码审计、红蓝紫队、威胁情报、漏洞研究、12 个 Coff0xc 防御扩展 |
| 🏛 **架构** | API 设计、云原生、消息队列、缓存、安全架构 |
| 💻 **开发** | Python, TypeScript, Go, Rust, Java, C++, Shell |
| 🚀 **DevOps** | Git 工作流、测试、数据库、可观测性、性能优化 |
| 🤖 **AI / ML** | Agent 开发、LLM 安全、RAG、Prompt 工程 |
| 🎨 **前端** | 4 种设计体系——毛玻璃、液态玻璃、新粗野、粘土态 |
| 📑 **文档** | Word, PDF, PPT, Excel —— OOXML 级别自动化 |
| 📡 **基础设施 / 移动 / 数据** | K8s, GitOps, IaC · iOS, Android, RN, Flutter · 管道、流处理、质量 |
| 🎭 **编排** | 多 Agent 协调 |

其中 5 个技能附带**可执行的验证工具**，供 CI 使用：

```bash
node skills/analyzing-security/scripts/security_scanner.js .       # OWASP / 注入 / 密钥泄露
node skills/checking-code-quality/scripts/quality_checker.js .     # 复杂度、重复、命名
node skills/analyzing-changes/scripts/change_analyzer.js --mode staged
node skills/verifying-modules/scripts/module_scanner.js <path>
node skills/generating-docs/scripts/doc_generator.js <path>
```

---

## 安装

| 目标 | 命令 | 产物 |
|---|---|---|
| <img src="https://img.shields.io/badge/-Claude_Code-9b8cff?style=flat-square" alt="Claude"> | `npx code-abyss -t claude -y` | `CLAUDE.md` + 技能 + 输出风格 + 设置 |
| <img src="https://img.shields.io/badge/-Codex_CLI-9b8cff?style=flat-square" alt="Codex"> | `npx code-abyss -t codex -y` | `instruction.md` + 技能 + config.toml |
| <img src="https://img.shields.io/badge/-Gemini_CLI-9b8cff?style=flat-square" alt="Gemini"> | `npx code-abyss -t gemini -y` | `GEMINI.md` + 技能 + 命令 |
| <img src="https://img.shields.io/badge/-OpenClaw-9b8cff?style=flat-square" alt="OpenClaw"> | `npx code-abyss -t openclaw -y` | 技能 + 工作区 `AGENTS.md` / `SOUL.md` |

```bash
npx code-abyss                      # 交互式 — 选目标、选人格、选风格
npx code-abyss --list-styles        # 浏览可用风格
npx code-abyss --uninstall claude   # 干净卸载，恢复用户备份
```

Code Abyss 把每一个安装的文件追踪到 `.code-abyss-backup/manifest.json`，卸载时逐字恢复你原本的配置。**用户自定义技能与 Code Abyss 共存**——你放在 `~/.{target}/skills/` 下的任何文件，install / uninstall 全周期都不会丢。

### 升级路径

| 从 | 到 | 路径 |
|---|---|---|
| v3.0.x | v3.1.x | `npx code-abyss -t <target> -y` —— 原地升级 |
| v2.x | v3.x | 先 `npx code-abyss --uninstall <target>`，再装 v3 |

---

## Tech Persona Card · 开放标准

Code Abyss 推出 **[Tech Persona Card v1.0](../docs/specs/tech-persona-card-v1.0.md)**——首个 AI Agent 技术人格互换标准。可以理解为 Character Card V2 的工程版。

每个人格以结构化的 `persona-card.json` 发布，包含声音、能力、场景和三层内容引用：

```jsonc
{
  "spec": "tech-persona-card",
  "spec_version": "1.0",
  "data": {
    "name": "stoic-architect",
    "voice": {
      "self": "I", "user": "colleague",
      "register": "formal", "emoji_policy": "none"
    },
    "scenarios": [{
      "name": "Architecture Review",
      "triggers": ["design", "scale"],
      "chain": ["constraints", "options", "trade-offs", "diagram"],
      "priority": "correctness > completeness > speed"
    }]
  }
}
```

**双向格式转换**开箱即用：

```js
const { toCharaCardV2, toGPTInstructions, fromCharaCardV2 } =
  require('code-abyss/bin/lib/persona-converter');

const cc  = toCharaCardV2(card, { identityContent });   // → SillyTavern / Chub.ai
const gpt = toGPTInstructions(card, { identityContent });// → OpenAI 自定义 GPT
```

[**规范文档**](../docs/specs/tech-persona-card-v1.0.md) · [**JSON Schema**](../docs/specs/persona-card.schema.json) · [**参考卡片**](../config/personas/)

---

## 为什么用 Code Abyss

|  | 不用 Code Abyss | 用 Code Abyss |
|---|---|---|
| **身份** | 扁平客服腔 | 有名字、有声音、稳定一致 |
| **执行** | 临场发挥，因 prompt 而异 | 铁律 + 执行链固化 |
| **领域深度** | 通用最佳实践 | 22 个技能按上下文加载 |
| **跨平台** | 每个 CLI 重写一遍 prompt | 一份规范，四个平台 |
| **可复现** | 跨会话 prompt 漂移 | `persona-card.json` 版本化 |
| **可移植** | 锁死在单一运行时 | 转 CharaCard V2、GPT Instructions |

---

## 参与贡献

```bash
git clone https://github.com/telagod/code-abyss && cd code-abyss
npm install
npm test                    # 375 个测试
npm run verify:skills       # 验证 22 个技能契约
```

**添加技能**——创建 `skills/<动名词>/SKILL.md`，按 [SKILL frontmatter 规范](https://agentskills.io/specification) 编写，可选添加 `scripts/` 放可执行工具。`npm run verify:skills` 验证契约。

**提交人格**——通过[提交门户](https://telagod.github.io/code-abyss/submit.html#zh)开 Issue。官网会引导你用自己的 AI 生成 `persona-card.json` + `identity.md`、检查内容、通过预配置的 Issue 模板提交。

---

<p align="center">
  <sub>
    <b>MIT 许可</b> · v4.0.0 · 由 <a href="https://github.com/telagod">@telagod</a> 以紫宵脉炼制
  </sub>
</p>
