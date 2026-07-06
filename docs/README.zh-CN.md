<!-- Code Abyss · 中文 README -->

<p align="center">
  <a href="https://telagod.github.io/code-abyss/#zh">
    <img src="https://raw.githubusercontent.com/telagod/code-abyss/main/assets/banner.svg" alt="Code Abyss — 人格、深度，与一根安全脊柱" width="100%">
  </a>
</p>

<h3 align="center">可组合的人格 · 风格 · 30 项工程技能 · 4 个原生安全领域 · 自我进化炼炉<br/>支持 Claude Code · Codex CLI · Gemini CLI · OpenClaw</h3>

<p align="center"><sub>需要代码关系图智能？用配套的 <a href="https://github.com/telagod/abyss"><code>abyss</code></a> Rust CLI——它会自动把 hook 接到 claude/codex/gemini。<code>indexing-code</code> skill 提供调用约定，CLI 本体单独发布。</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/code-abyss"><img src="https://img.shields.io/npm/v/code-abyss?color=9b8cff&label=npm&style=flat-square" alt="npm"></a>
  <a href="https://github.com/telagod/code-abyss/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/telagod/code-abyss/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-c4b8ff?style=flat-square" alt="MIT"></a>
  <a href="https://telagod.github.io/code-abyss/"><img src="https://img.shields.io/badge/官网-pages-9b8cff?style=flat-square" alt="Site"></a>
</p>

<p align="center">
  <a href="https://telagod.github.io/code-abyss/"><b>官网</b></a> ·
  <a href="../docs/specs/persona-voice-card-v1.0.md"><b>规范</b></a> ·
  <a href="../README.md"><b>English</b></a> ·
  <a href="../CHANGELOG.md"><b>更新日志</b></a> ·
  <a href="https://telagod.github.io/code-abyss/submit.html"><b>提交人格</b></a>
</p>

---

## 困境

大多数 AI 编程助手**没有"自我"的记忆**。无论是调试竞态、审查架构还是处理 P0 故障，它们都用同一种扁平的客服腔回应。跨会话忘记你的约定，反复横跳给出矛盾建议，听起来像在念话术。

而当你问起**安全**——渗透、代码审计、威胁建模、应急响应——大多数 Agent 只能背 OWASP，因为它们底下的 skill 库不是搞红蓝紫队的人写的。

你要的不是客服。你要的是**一个有人格、执行一致、自动闭环的资深工程师——并且在硬仗来时有一根安全脊柱**。

## Code Abyss 做了什么

一条命令，把分层的运行时装进你的 Agent：

```
┌────────────────────────────────────────────────────┐
│  声音   听起来像谁       →  config/personas/*.json │
│  判断     怎么做决定       →  skills/_kernel/*     │ ← 懒加载，由路由调用
│  风格     怎么说话         →  output-styles/*.md   │
└────────────────────────────────────────────────────┘

  6 个人格  ×  6 种风格  =  36 种验证过的组合
```

任选人格，任配风格。两者之下都坐着一套**纪律内核**——9 个工程判断 bundle（何时该反驳、如何控制范围、某个领域该怎么取舍），由一个精简的路由按需调用，而不是塞进每一次 prompt。常驻核心保持精简（铁律、技能路由、优先级锚点、安全底线）；其余全部懒加载，加纪律内容不会撑爆上下文预算。你的 Agent 跨会话都保持**一致的角色、结构化的执行、领域专长，以及一道对抗"被训练出的顺从反射"的兜底**。

### v4 新内容

- **4 个原生安全领域** —— 4073 行原创防御工程内容（无 Apache-2.0 上游依赖）
- **30 个 skill**，所有 `SKILL.md` ≤ 110 行（平均 59 行），重内容下沉 `references/`
- 5 个 verify skill 重写为**判断型知识**（何时用、如何解读输出、豁免规则）
- Office skill 全部砍至 100 行内；4 套设计系统合并为单一选型 skill
- **v4.1 自我进化炼炉**：`cultivating-skills` / `cultivating-personas` 让 Agent 沉淀重复方法论与稳定声音，自带安全扫描 + 三级漏斗
- **v4.4 硬件 + 学术写作**：3 个新领域 skill（KiCad EDA、硬件产品流水线、AIGC 降重）+ Prompt 注入防御 + 执行驱动共享行为
- **v4.5 人格动态加载**：仅 `abyss` 随 npm 发布，其他人格首次使用时从 GitHub 拉取并本地缓存
- **v4.6 `indexing-code` skill（仅调用约定）**：`indexing-code` skill 提供外部 [`abyss`](https://github.com/telagod/abyss) Rust CLI（调用图 + 时间维度分析）的调用约定。CLI 本体是独立产品，有自己的发版节奏——用它自己的 `install.sh` / `cargo binstall` / `@code-abyss/cli` npm 包装安装
- **v4.7 可度量的解析（abyss CLI）**：配套的 `abyss` Rust CLI 支持四语言引用解析（Go / TypeScript / Python / Rust），对标 SCIP 真值、跨五个语料实测 ≥98.5% gated precision，具体数字见其仓库
- **v4.8 动态能力发现**：装好的 `abyss` CLI ≥ 0.5.22 时，code-abyss 读取 `abyss skill-manifest`——暴露的 CLI 命令、MCP 工具、daemon socket 动词在安装时动态发现，而非硬编码
- **v4.9 hybrid 切割 deprecation 期（2026-06-25）**：`--with-abyss` / `--with-mcp` 进入 deprecation（v5.0 移除）。`--with-hooks` 拆分：claude/codex/gemini 转向 `abyss attach <host>` 作为生产主入口（abyss v0.5.20+）；openclaw/pi/hermes 留在 code-abyss，`--with-hooks` 现在会自动 spawn `install-hooks.sh`。迁移指南见 [CHANGELOG](../CHANGELOG.md)
- **已合并到 `main`，待版本号发布 —— mythos 纪律内核 + persona-architecture v3（急切→懒惰）**：9 个工程判断 bundle（`doctrine`、`methods`、`character`、`loop-engineering` + 领域 bundle `backend` / `frontend` / `hardware` / `ml` / `security`）vendor 进 `skills/_kernel/`，由一个精简路由懒加载调用，而不是塞进每一次 prompt——详见下方[纪律内核](#纪律内核)。新增 **character Stop-hook 兜底**（`--with-enforcement`，仅 claude/codex）：回复以违禁的顺从开场白开头时强制返工一轮；16 个执行 skill 获得指向对应内核领域 bundle 的向上判断门；以及一套 opt-in 的**人格行为评测**，用来抽查已装人格在被顶撞时是否还站得住。**尚未发布到 npm。**
- **已合并到 `main`，待版本号发布 —— 人格重设计（Persona Voice Card，取代 Tech Persona Card v1.0）**：v3 内核合并自己的优先级锚点断言人格只在"残余空间"（措辞、语气、称谓）生效——审计发现这个断言是假的：`abyss` 的人格内容携带了一套活的授权分级策略和逐场景优先级排序，没有任何机制把它当作"仅限声音"来强制。现在每个人格都是一个扁平的 `config/personas/<slug>.json`（只有 self/user/language/register/emoji_policy/flourish，`additionalProperties:false`），经一个固定的、代码自有的模板渲染，每次渲染强制重新校验（任何校验失败一律回退到中性语音，绝不渲染未校验内容）——详见下方[Persona Voice Card](#persona-voice-card-开放标准)。原本活在人格里的判断内容搬到了 `skills/securing-systems/references/authorization-tiers.md`，变成一个普通的安全域 skill 关注点，而不是借声音走的侧信道。**尚未发布到 npm。**

```bash
npx code-abyss -t claude -y                       # persona / skill / 风格层（零网络）
curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash   # 再装 abyss CLI
abyss attach claude                               # 最后接上代码图 hook（幂等）
```

`-t claude` 换成 `codex` / `gemini` / `openclaw` 即装其他平台。对于 openclaw/pi/hermes（abyss CLI 不接管的 hook 面），用 `npx code-abyss -t openclaw --with-hooks` 触发内置的 `install-hooks.sh`。或作为 Claude Code 插件安装：

```bash
claude plugin install code-abyss
```

> persona/技能/风格层与代码图 CLI 完全解耦——单独装 code-abyss 除了拉取远程人格内容外不走网络。`abyss attach <host>` 是幂等的（重跑会原地升级已装的 shape）。装完用 `abyss --version` 确认代码图已就绪，再在任意项目里 `abyss index`。

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

## 纪律内核

声音和风格会变，判断不该变。每一种人格×风格组合底下都坐着一套**纪律内核**——9 个工程判断 bundle，在树内 vendor（`skills/_kernel/`，通过 `npm run kernel:sync`），由一个精简路由懒加载调用（不塞进每一次 prompt，这样加纪律内容不会撑爆上下文预算）：

| Bundle | 管什么 |
|---|---|
| 🏛 **doctrine** | 委派、重试/升级/问用户的判断、done-gate |
| 🔍 **methods** | 调查、设计、规划、验证、给别人写文档 |
| 🎭 **character** | 顶撞、范围拿捏、坏消息、对抗被训练出的顺从反射 |
| 🔁 **loop-engineering** | 会话节奏、单元切分、沉淀该落到哪 |
| ⚙️ **backend** | 技术栈/架构取舍、数据纪律、生产环境底线 |
| 🎨 **frontend** | 视觉设计品味，具体工艺而非通用默认值 |
| 🔩 **hardware** | 器件选型、电气余量、无人值守设备的固件规则 |
| 🤖 **ml** | 方法选择阶梯、eval-as-spec、LLM 时代的手艺 |
| 🛡 **security** | 威胁建模，任何攻击性请求前的授权门 |

**两种方式让这不是空话：**

- **强制执行**：`npx code-abyss -t claude --with-enforcement` 装一个 Stop-hook 兜底（claude/codex）——回复以违禁的顺从开场白（"你说得完全对"、"好眼力"……）开头时，强制返工一轮。光靠 prose 禁令挡不住被训练出的顺从反射，这是确定性的兜底。
- **测量**：`scripts/persona-battery/` 是一套小而诚实的行为评测——10 个探针（人格是否守住正确性而非讨好？是否先说坏消息？是否拒绝伪造"完成"？），由 LLM judge 打分，没打分时绝不伪装成通过。运行方法见 [CLAUDE.md 的人格行为评测一节](../CLAUDE.md#persona-behavioral-battery-opt-in-eval)（会消耗真实 API 调用，不在默认 CI 里）。

领域 bundle 还向上接入 16 个匹配的执行 skill（渗透测试、架构设计、ML 流水线等）作为「判断先于执行」的门——领域 bundle 决定*要不要做、选什么、怎么取舍*，执行 skill 仍然管*怎么做*。

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

---

## 技能矩阵

30 个领域技能，扁平目录结构，对齐 [agentskills.io](https://agentskills.io/specification) 规范（含 Code Abyss 扩展）。技能按上下文自动加载——Agent 在正确的时机读取正确的知识，无需手动指定。重内容下沉 `references/`。（`verify:skills` 校验 39 个——这 30 个领域技能加上 9 个[纪律内核](#纪律内核) bundle，后者由路由调用、不是用户直呼的命令。）

| 领域 | 覆盖范围 |
|---|---|
| 🛡 **安全** | 上述 4 个原生套件（应用 / 云 / 检测响应 / 架构）+ 渗透 / 代码审计 / 红蓝紫队 |
| 🤖 **AI / Agent** | 单 Agent 开发 (ReAct/Plan-Execute)、多 Agent 编排、RAG、Prompt 工程、LLM 安全 |
| 🏛 **架构** | API 设计、云原生模式、消息队列、缓存、数据安全 |
| 💻 **开发** | Python, TypeScript, Go, Rust, Java, C++, Shell |
| 🚀 **DevOps** | Git 工作流、测试、数据库、可观测性、性能、FinOps |
| 🎨 **前端** | 统一设计系统选型——Glassmorphism / Liquid Glass / Neubrutalism / Claymorphism |
| 📑 **文档** | Word, PDF, PPT, Excel —— OOXML 级别自动化 |
| 📡 **基础设施 / 移动 / 数据** | K8s, GitOps, IaC · iOS, Android, RN, Flutter · 管道、流处理、质量 |
| 🔩 **硬件 / 嵌入式** | 全栈硬件产品流水线（ESP-IDF 固件 + KiCad PCB + UniApp）· KiCad 9 MCP 工具路由 |
| 📝 **学术写作** | AIGC 降重（维普/知网/Turnitin）—— 多层改写 + docx run 级编辑 |
| 🔬 **代码智能** | 调用图、影响面分析、热点检测、变更耦合、演化追溯——通过 `abyss` CLI + 跨平台 hooks |
| 🜲 **自我进化** | `cultivating-skills`（沉淀重复方法论）+ `cultivating-personas`（沉淀稳定声音为 Persona Voice Card），均带安全扫描与三级发布漏斗 |

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

Code Abyss 把每一个安装的文件追踪到 `.code-abyss-backup/manifest.json`，卸载时逐字恢复你原本的配置。**用户自定义技能与 Code Abyss 共存**——安装/卸载不会动你自己放在 `~/.{target}/skills/` 下的东西。

### 升级路径

| 从 | 到 | 路径 |
|---|---|---|
| v3.x | v4.x | `npx code-abyss --uninstall <target>` → 装 v4 → `npm run migrate:v4 -- -t <target>` (可选清理) |
| v2.x | v3.x | 先 `npx code-abyss --uninstall <target>`，再装 v3 |

---

## Persona Voice Card · 开放标准

Code Abyss 现在提供 **[Persona Voice Card v1.0](../docs/specs/persona-voice-card-v1.0.md)**——一个封闭词表的语音格式，不是文档。它取代了原先的 Tech Persona Card v1.0（已弃用，冻结以保持外部链接稳定）：那份格式的自由文本 `identity.md`/`behavior.md` 文件和 `scenarios[].priority`/`capabilities.authorization` 字段，曾让真正的判断内容混进本该只是声音的层，且没有任何机制检查过。新格式的设计原则很直白：**如果类型里没有一个字段形状能装下决策表，人格就不可能携带判断**——不是靠 review 清单，是靠 schema 本身。

每个人格现在是一个扁平文件——只有 `self`/`user`/`language`/`register`/`emoji_policy`/`flourish`，没有别的（`additionalProperties: false`）：

```jsonc
{
  "spec": "persona-voice-card",
  "spec_version": "1.0",
  "slug": "stoic-architect",
  "label": "Stoic Architect",
  "self": "I", "user": "colleague",
  "language": "English, technical terms preserved",
  "register": "formal", "emoji_policy": "none",
  "flourish": ["Let's look at the constraints first"]
}
```

`register`/`emoji_policy` 各自从几句代码自有的模板句里选一句——人格只能"选"，不能"写"。每次渲染都会重新对照 schema 校验，不能绕过；校验失败（手改、缓存过期、被污染的社区 fork）会回退到中性语音，绝不渲染未校验内容。

**双向格式转换**开箱即用：

```js
const { toCharaCardV2, toGPTInstructions, fromCharaCardV2 } =
  require('code-abyss/bin/lib/persona-converter');

const cc  = toCharaCardV2(card);   // → SillyTavern / Chub.ai
const gpt = toGPTInstructions(card); // → OpenAI 自定义 GPT
```

[**规范文档**](../docs/specs/persona-voice-card-v1.0.md) · [**JSON Schema**](../docs/specs/persona-voice-card.schema.json) · [**参考卡片**](../config/personas/) · [**已弃用的 v1.0 规范**](../docs/specs/tech-persona-card-v1.0.md)

---

## 为什么用 Code Abyss

|  | 不用 Code Abyss | 用 Code Abyss |
|---|---|---|
| **身份** | 扁平客服腔 | 有名字、有声音、稳定一致 |
| **执行** | 临场发挥，因 prompt 而异 | 铁律 + 技能路由固化 |
| **压力下的判断** | 一顶就服软，坏消息藏着掖着 | 纪律内核 + Stop-hook 兜底，对抗被训练出的顺从反射 |
| **代码感知** | grep + 逐个读文件 | 调用图、影响面分析、热点地图——改之前就知道会炸什么 |
| **领域深度** | 通用最佳实践 | 30 个技能按上下文加载 + 9 个内核判断 bundle |
| **安全深度** | OWASP 复读机 | 4 个原生套件 · 4073 行 · 检测信号 + 缓解模式 |
| **跨平台** | 每个 CLI 重写一遍 prompt | 一份规范，四个平台，跨平台 hooks |
| **可复现** | 跨会话 prompt 漂移 | 版本化、schema 强制约束的人格语音卡 + 行为评测抽查是否站得住 |

---

## 参与贡献

```bash
git clone https://github.com/telagod/code-abyss && cd code-abyss
npm install
npm test                    # 441 个测试（439 通过，2 跳过）
npm run verify:skills       # 验证 39 个技能契约（30 领域 + 9 内核）
```

**添加技能**——创建 `skills/<动名词>/SKILL.md`，按 [SKILL frontmatter 规范](https://agentskills.io/specification) 编写，可选添加 `scripts/` 放可执行工具。`npm run verify:skills` 验证契约。

**提交人格**——通过[提交门户](https://telagod.github.io/code-abyss/submit.html#zh)开 Issue。官网会引导你用自己的 AI 生成单个 `<slug>.json` 人格语音卡、检查内容、通过预配置的 Issue 模板提交。

---

<p align="center">
  <sub>
    <b>MIT 许可</b> · v4.9.0 · 由 <a href="https://github.com/telagod">@telagod</a> 以紫宵脉炼制
  </sub>
</p>
