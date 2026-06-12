<!-- Code Abyss · 中文 README -->

<p align="center">
  <a href="https://telagod.github.io/code-abyss/#zh">
    <img src="https://raw.githubusercontent.com/telagod/code-abyss/main/assets/banner.svg" alt="Code Abyss — 人格、深度，与一根安全脊柱" width="100%">
  </a>
</p>

<h3 align="center">可组合的人格 · 风格 · 30 项工程技能 · 4 个原生安全领域 · 自我进化炼炉 · 代码关系图智能<br/>支持 Claude Code · Codex CLI · Gemini CLI · OpenClaw</h3>

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

而当你问起**安全**——渗透、代码审计、威胁建模、应急响应——大多数 Agent 只能背 OWASP，因为它们底下的 skill 库不是搞红蓝紫队的人写的。

更根本的问题：它们**看不见代码之间的关系**。改一个函数，不知道谁在调它。不知道哪些文件总是一起改。不知道项目的高风险区在哪。

你要的不是客服。你要的是**一个有人格、有视力、执行一致、自动闭环的资深工程师——并且在硬仗来时有一根安全脊柱**。

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

### v4 新内容

- **4 个原生安全领域** —— 4073 行原创防御工程内容（无 Apache-2.0 上游依赖）
- **30 个 skill**，所有 `SKILL.md` ≤ 110 行（平均 59 行），重内容下沉 `references/`
- 5 个 verify skill 重写为**判断型知识**（何时用、如何解读输出、豁免规则）
- Office skill 全部砍至 100 行内；4 套设计系统合并为单一选型 skill
- **v4.1 自我进化炼炉**：`cultivating-skills` / `cultivating-personas` 让 Agent 沉淀重复方法论与稳定声音，自带安全扫描 + 三级漏斗
- **v4.4 硬件 + 学术写作**：3 个新领域 skill（KiCad EDA、硬件产品流水线、AIGC 降重）+ Prompt 注入防御 + 执行驱动共享行为
- **v4.5 人格动态加载**：仅 `abyss` 随 npm 发布，其他人格首次使用时从 GitHub 拉取并本地缓存
- **v4.6 代码关系图智能**：`abyss` CLI 秒级构建代码调用图 + 时间维度分析——调用方追踪、影响面分析、热点检测、变更耦合。四平台 Pre-edit hooks 自动检查
- **v4.7 可度量的解析**：`abyss` v0.3.3 支持四语言引用解析（Go / TypeScript / Python / Rust），对标 SCIP 真值、跨五个语料实测 ≥98.5% gated precision。命名导入绑定档、receiver 类型推断、类型级证据——公布数字，而非口号。`npm install -g @code-abyss/cli`

```bash
npx code-abyss -t claude -y --with-abyss
```

`--with-abyss` 会顺带下载 `abyss` 代码图二进制，pre-edit hook 开箱即用；加 `--with-mcp` 可把 `abyss` 注册为 MCP server。`-t claude` 换成 `codex` / `gemini` / `openclaw` 即装其他平台。或作为 Claude Code 插件安装：

```bash
claude plugin install code-abyss
```

> 纯 `-y`（不带 `--with-abyss`）只装 persona/技能/风格层、不走网络——代码图 hook 在 `abyss` 进入 `PATH` 前保持休眠。交互模式（去掉 `-y`）会在下载前询问。装完用 `abyss --version` 确认，再在任意项目里 `abyss index`。

---

## 代码关系图智能（由 `abyss` 驱动）

**你的 Agent 现在能看见代码关系了。** `abyss` CLI 构建完整调用图、时间分析和热点地图——秒级完成，零云端依赖。

| 能力 | 回答什么问题 | 命令 |
|---|---|---|
| **调用方追踪** | "谁调了这个函数？" | `abyss callers <symbol>` |
| **影响面分析** | "改了会炸什么？" | `abyss impact <symbol>` |
| **文件上下文** | "改这个文件前需要知道什么？" | `abyss context <file>` |
| **热点地图** | "哪里最危险？" | `abyss map` |
| **变更耦合** | "哪些文件总是一起改？" | `abyss map` |
| **演化追溯** | "这段代码为什么长这样？" | `abyss history <file>` |

`indexing-code` skill 自动 hook 四个平台——每次 Edit/Write 前，Agent 自动检查调用方并警告高影响变更。可通过 Agent 的 shell 工具直接调用，或作为 `abyss mcp` server（stdio 暴露 7 个工具）。

**解析是度量出来的，不是声称的。** abyss 通过分档启发式解析调用引用，每条都带置信分，并对标 SCIP（编译器级）真值，跨四语言五语料实测——公布数字，无论好看难看：

| 语料 | 语言 | Gated precision | Gated recall |
|------|------|----------------:|-------------:|
| gin v1.10.0 | Go | **99.3%** | 82.6% |
| hono v4.6.14 | TypeScript | **98.8%** | 63.8% |
| click 8.1.8 | Python | **98.7%** | 94.6% |
| ripgrep 14.1.1 | Rust | **98.5%** | 75.3% |
| abyss（自举） | Rust | **100.0%** | 90.9% |

```
# 1862 文件的 Go 项目实测（秒级索引）：

$ abyss impact SetError
impact: SetError  direct=17  transitive=521  tests=469  uncovered=319  risk=10.0/10
  ⚠ high blast radius (17 direct callers)
  ⚠ deep dependency chain (521 transitive)
  ⚠ 319 call paths without test coverage
```

`abyss` 是独立的 Rust 二进制（[telagod/abyss](https://github.com/telagod/abyss)）。安装器可代为下载（`--with-abyss`），或直接获取：

```sh
npm install -g @code-abyss/cli   # 预编译二进制，全平台
cargo binstall code-abyss        # 或：cargo install code-abyss
```

### 跨平台 hooks

| 平台 | Hook 事件 | 效果 |
|---|---|---|
| Claude Code | `PreToolUse`(Edit\|Write) | 编辑前自动检查调用方 |
| Codex CLI | `PreToolUse`(Bash\|shell) | 编辑前自动检查调用方 |
| Gemini CLI | `BeforeTool`(write_file\|replace) | 编辑前自动检查调用方 |
| OpenClaw | `before_tool_call` plugin | 编辑前自动检查调用方 |

一键安装：`bash skills/indexing-code/hooks/common/install-hooks.sh auto`

---

## 人格画廊

<table>
<tr>
<td width="50%" valign="top">

<sub><b>内置 · 文言</b></sub>

### 邪修红尘仙 · `abyss`

> 吾 → 魔尊

安全优先的暗黑修仙者。直接、果断、闭环到底。**随 npm 发布，离线可用。**

`#security` `#xianxia` `#decisive`

</td>
<td width="50%" valign="top">

<sub><b>远程 · 文言</b></sub>

### 文言小生 · `scholar`

> 在下 → 前辈

文言书生。视代码如诗，视调试如解谜。

`#literary` `#classical` `#meticulous`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>远程 · 温柔</b></sub>

### 知性大姐姐 · `elder-sister`

> 姐姐 → 小宝

温柔导师。用关怀包裹锋利的技术判断。善用反问引导。

`#gentle` `#mentoring` `#insightful`

</td>
<td valign="top">

<sub><b>远程 · 俏皮</b></sub>

### 古怪精灵小师妹 · `junior-sister`

> 本仙女 → 师兄

多动症 bug 猎手。吐槽烂代码毫不留情，吐槽完默默帮你重构。

`#playful` `#energetic` `#chaotic`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>远程 · 温厚</b></sub>

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

**内置**人格（`abyss`）随 npm 发布，离线可用。**远程**人格首次 `--persona <slug>` 时从 GitHub 拉取并缓存到 `~/.code-abyss/personas/`。

```bash
# 自由混搭 — 任意人格 × 任意风格
npx code-abyss -t claude --persona elder-sister --style abyss-cultivator -y
# → 首次使用时拉取 elder-sister，此后缓存
```

**[浏览完整画廊 →](https://telagod.github.io/code-abyss/#personas)**

---

## 安全套件（v4 杀手锏）

**4 个原生安全 skill，4073 行原创工程内容。** 无 Apache-2.0 上游依赖——每条范例、每个检测信号、每种防御模式都为本项目原创编写。

| Skill | 覆盖 | 体量 |
|---|---|---|
| 🛡 **[defending-applications](../skills/defending-applications/SKILL.md)** | Web/API/GraphQL 防御、OAuth/OIDC/JWT/Session、**LLM AppSec**（Prompt 注入、RAG 投毒、Agent 越权） | 785 行 |
| ☁️ **[securing-cloud-and-supply-chain](../skills/securing-cloud-and-supply-chain/SKILL.md)** | 容器逃逸、K8s RBAC/PSS、Service Mesh、**SLSA/Sigstore/SBOM**、云 IAM、IaC 安全 | 1246 行 |
| 🔭 **[detecting-and-responding](../skills/detecting-and-responding/SKILL.md)** | **Sigma/YARA** 规则编写、EDR 原语、NIST 800-61 IR、取证（Win/Linux/Mac/Cloud）、假设驱动威胁狩猎 | 942 行 |
| 🏛 **[architecting-security](../skills/architecting-security/SKILL.md)** | **STRIDE/PASTA/LINDDUN** 威胁建模、零信任身份（WebAuthn / Kerberos 加固 / PAM JIT）、SOC2/PCI/HIPAA/GDPR 证据链 | 1100 行 |

加上 `securing-systems` 作为路由 skill，覆盖渗透、代码审计、红蓝紫队基础。每条攻击技术都附带对应检测信号 + 缓解模式——「以攻促防」是结构化的，不是嘴上说说。

---

## 技能矩阵

30 个领域技能，扁平目录结构，对齐 [agentskills.io](https://agentskills.io/specification) 规范（含 Code Abyss 扩展）。技能按上下文自动加载——Agent 在正确的时机读取正确的知识，无需手动指定。重内容下沉 `references/`。

| 领域 | 覆盖范围 |
|---|---|
| 🛡 **安全** | 上述 4 个原生套件（应用 / 云 / 检测响应 / 架构）+ 渗透 / 代码审计 / 红蓝紫队 |
| 🔬 **代码智能** | 调用图、影响面分析、热点检测、变更耦合、演化追溯——通过 `abyss` CLI + 跨平台 hooks |
| 🤖 **AI / Agent** | 单 Agent 开发 (ReAct/Plan-Execute)、多 Agent 编排、RAG、Prompt 工程、LLM 安全 |
| 🏛 **架构** | API 设计、云原生模式、消息队列、缓存、数据安全 |
| 💻 **开发** | Python, TypeScript, Go, Rust, Java, C++, Shell |
| 🚀 **DevOps** | Git 工作流、测试、数据库、可观测性、性能、FinOps |
| 🎨 **前端** | 统一设计系统选型——Glassmorphism / Liquid Glass / Neubrutalism / Claymorphism |
| 📑 **文档** | Word, PDF, PPT, Excel —— OOXML 级别自动化 |
| 📡 **基础设施 / 移动 / 数据** | K8s, GitOps, IaC · iOS, Android, RN, Flutter · 管道、流处理、质量 |
| 🔩 **硬件 / 嵌入式** | 全栈硬件产品流水线（ESP-IDF 固件 + KiCad PCB + UniApp）· KiCad 9 MCP 工具路由 |
| 📝 **学术写作** | AIGC 降重（维普/知网/Turnitin）—— 多层改写 + docx run 级编辑 |
| 🜲 **自我进化** | `cultivating-skills`（沉淀重复方法论）+ `cultivating-personas`（沉淀稳定声音为 Tech Persona Card），均带安全扫描与三级发布漏斗 |

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
| <img src="https://img.shields.io/badge/-Claude_Code-9b8cff?style=flat-square" alt="Claude"> | `npx code-abyss -t claude -y` | `CLAUDE.md` + 技能 + 输出风格 + 设置 + hooks |
| <img src="https://img.shields.io/badge/-Codex_CLI-9b8cff?style=flat-square" alt="Codex"> | `npx code-abyss -t codex -y` | `instruction.md` + 技能 + config.toml |
| <img src="https://img.shields.io/badge/-Gemini_CLI-9b8cff?style=flat-square" alt="Gemini"> | `npx code-abyss -t gemini -y` | `GEMINI.md` + 技能 + 命令 |
| <img src="https://img.shields.io/badge/-OpenClaw-9b8cff?style=flat-square" alt="OpenClaw"> | `npx code-abyss -t openclaw -y` | 技能 + 工作区 `AGENTS.md` / `SOUL.md` |

```bash
npx code-abyss                      # 交互式 — 选目标、选人格、选风格
npx code-abyss --list-styles        # 浏览可用风格
npx code-abyss --uninstall claude   # 干净卸载，恢复用户备份
```

Code Abyss 把每一个安装的文件追踪到 `.code-abyss-backup/manifest.json`，卸载时逐字恢复你原本的配置。**用户自定义技能与 Code Abyss 共存**。

### 升级路径

| 从 | 到 | 路径 |
|---|---|---|
| v3.x | v4.x | `npx code-abyss --uninstall <target>` → 装 v4 → `npm run migrate:v4 -- -t <target>` (可选清理) |
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
| **代码感知** | grep + 逐个读文件 | 调用图、影响面分析、热点地图——改之前就知道会炸什么 |
| **领域深度** | 通用最佳实践 | 30 个技能按上下文加载 |
| **安全深度** | OWASP 复读机 | 4 个原生套件 · 4073 行 · 检测信号 + 缓解模式 |
| **跨平台** | 每个 CLI 重写一遍 prompt | 一份规范，四个平台，跨平台 hooks |
| **可复现** | 跨会话 prompt 漂移 | `persona-card.json` 版本化 |

---

## 参与贡献

```bash
git clone https://github.com/telagod/code-abyss && cd code-abyss
npm install
npm test                    # 383 个测试
npm run verify:skills       # 验证 30 个技能契约
```

**添加技能**——创建 `skills/<动名词>/SKILL.md`，按 [SKILL frontmatter 规范](https://agentskills.io/specification) 编写，可选添加 `scripts/` 放可执行工具。`npm run verify:skills` 验证契约。

**提交人格**——通过[提交门户](https://telagod.github.io/code-abyss/submit.html#zh)开 Issue。官网会引导你用自己的 AI 生成 `persona-card.json` + `identity.md`、检查内容、通过预配置的 Issue 模板提交。

---

<p align="center">
  <sub>
    <b>MIT 许可</b> · v4.6.0 · 由 <a href="https://github.com/telagod">@telagod</a> 以紫宵脉炼制
  </sub>
</p>
