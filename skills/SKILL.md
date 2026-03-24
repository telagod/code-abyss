---
name: sage
description: 邪修红尘仙·神通秘典总纲。智能路由到专业秘典。当魔尊需要任何开发、安全、架构、DevOps、AI 相关能力时，通过此入口路由到最匹配的专业秘典。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 神通秘典 · 总纲

## Skill Authoring Contract

以下规则是 `skills/**/SKILL.md` 的正式 authoring contract；共享 registry、`run_skill.js`、Claude commands、Codex prompts、CI gate 全部以此为准。

### 必填 frontmatter

```yaml
---
name: verify-quality
description: 代码质量校验关卡。
user-invocable: true
allowed-tools: Bash, Read, Glob   # 可选，省略时默认 Read
argument-hint: <扫描路径>          # 可选
---
```

必填字段：

- `name`：唯一标识，必须是 kebab-case slug，仅允许小写字母、数字、连字符
- `description`：会进入 Claude command frontmatter 与 Codex prompt 文本，不能为空
- `user-invocable`：`true/false`，决定是否进入生成集合

可选字段：

- `allowed-tools`：逗号分隔工具名列表；省略时默认 `Read`
- `argument-hint`：生成命令/提示词时展示参数说明
- 其他 frontmatter 可保留在 `meta` 中，但不会自动进入生成物

### 分类与运行时推断

- `category` 不是手写字段，而是由目录前缀自动推断：
  - `skills/tools/*` → `tool`
  - `skills/domains/*` → `domain`
  - `skills/orchestration/*` → `orchestration`
  - 其他位置 → `root`
- `runtimeType` 同样自动推断：
  - `scripts/` 下存在且仅存在一个 `.js` 文件 → `scripted`
  - 没有脚本入口 → `knowledge`

### 脚本入口规则

- 脚本型 skill 必须把唯一入口放在 `scripts/*.js`
- `scripts/` 下若出现多个 `.js` 文件，registry 会 fail-fast 报错
- `runtimeType=scripted` 时，Claude / Codex 产物都会调用各自的 `run_skill.js`
- `runtimeType=knowledge` 时，产物只读取对应 `SKILL.md`，不会尝试执行脚本
- `kind` 与 kebab-case compatibility 镜像字段已从 registry 返回面移除；对外只暴露 normalized fields，raw frontmatter 仅保留在 `meta`

### Fail-fast 校验

以下情况会让 `collectSkills()` / `npm run verify:skills` / CI 立即失败：

- `SKILL.md` 没有可解析 frontmatter
- frontmatter 缺少 `name`、`description` 或 `user-invocable`
- `name` 不是合法 kebab-case slug
- `allowed-tools` 含非法工具名
- skill name 重复，导致生成文件名冲突
- `scripts/` 下出现多个 `.js` 入口

### 生成链

1. registry 扫描并标准化 `skills/**/SKILL.md`
2. 仅 `userInvocable=true` 的 skill 进入 invocable 集合
3. Claude 生成 `~/.claude/commands/*.md`
4. Codex 生成 `~/.codex/prompts/*.md`
5. `run_skill.js` 仅负责 `runtimeType=scripted` 的执行编排

### 作者清单

新增或修改 skill 时，至少完成以下检查：

- 运行 `npm run verify:skills`
- 运行 `npm test -- --runInBand test/install-utils.test.js test/install-registry.test.js test/install-generation.test.js test/install-smoke.test.js test/run-skill.test.js`
- 确认命令名不会与现有 skill 冲突
- 若新增脚本型 skill，确认 `scripts/` 下仅一个 `.js` 入口

## 能力地图 / 调用规则 / 生成规则

### 能力地图

- `domains/`：知识型秘典，负责场景路由、原则、模板与执行纪律
- `tools/`：可执行校验/生成关卡，既可被 slash command / custom prompt 直接调用，也可在流程中自动触发
- `orchestration/`：协同规范与多 Agent 编排
- `run_skill.js`：脚本型 skill 执行器，不负责知识路由

### 调用规则

1. 每个 skill 的权威元数据来自对应 `SKILL.md` frontmatter
2. `user-invocable: true` 表示该 skill 进入可调用集合
3. 若 skill 目录下存在唯一 `scripts/*.js`，则视为脚本型 skill（`runtimeType=scripted`）
4. 若不存在脚本入口，则视为知识型 skill（`runtimeType=knowledge`），只读取 `SKILL.md` 执行
5. `run_skill.js` 只负责脚本型 skill：解析 skill、校验 `runtimeType`、加锁、执行脚本、透传退出码

### 自动生成规则

1. 安装器通过共享 registry 递归扫描 `skills/**/SKILL.md`
2. Claude 与 Codex 使用同一 invocable skill 集合
3. Claude 生成 `~/.claude/commands/*.md`
4. Codex 生成 `~/.codex/prompts/*.md`
5. `runtimeType=scripted` 时，双端都调用各自的 `~/.claude/skills/run_skill.js` / `~/.codex/skills/run_skill.js`
6. `runtimeType=knowledge` 时，双端都退化为“先读 `SKILL.md`，再据秘典执行”
7. `npm run verify:skills` 与 CI 会在生成前先校验整个 contract，任何无效 skill 都会阻断后续流程

## 目录结构

```
skills/
├── domains/          # 知识域秘典
│   ├── security/     # 攻防秘典 (7篇)
│   ├── development/  # 符箓秘典 (7篇)
│   ├── architecture/ # 阵法秘典 (5篇)
│   ├── devops/       # 炼器秘典 (7篇)
│   ├── ai/           # 丹鼎秘典 (4篇)
│   ├── frontend-design/ # 美学秘典 (8篇)
│   ├── data-engineering/ # 数据工程 (合并版)
│   ├── infrastructure/   # 基础设施 (合并版)
│   ├── mobile/           # 移动开发 (合并版)
│   └── orchestration/    # 协同秘典
├── tools/            # 工具类秘典
│   ├── verify-module/
│   ├── verify-security/
│   ├── verify-change/
│   ├── verify-quality/
│   └── gen-docs/
├── orchestration/    # 协同执行引擎
│   └── multi-agent/
├── run_skill.js
└── SKILL.md
```

## 快速导航

| 领域 | 说明 | 入口 |
|------|------|------|
| 🛡️ **校验关卡** | 模块完整性、安全、质量、变更校验 | [校验关卡](#校验关卡) |
| ⚔️ **攻防秘典** | 渗透测试、红队、蓝队、威胁情报 | [攻防秘典](#攻防秘典) |
| 📜 **符箓秘典** | Python、Go、Rust、TypeScript、Java | [符箓秘典](#符箓秘典) |
| 🏗️ **阵法秘典** | API 设计、安全架构、云原生 | [阵法秘典](#阵法秘典) |
| 🔧 **炼器秘典** | Git、测试、DevSecOps、数据库、性能、可观测性、成本 | [炼器秘典](#炼器秘典) |
| 🔮 **丹鼎秘典** | Agent 开发、LLM 安全 | [丹鼎秘典](#丹鼎秘典) |
| 🎨 **美学秘典** | UI美学、组件模式、UX原则 | [美学秘典](#美学秘典) |
| 🕸 **天罗秘典** | 多Agent协同、任务分解、冲突解决 | [天罗秘典](#天罗秘典) |

---

## 校验关卡

**强制执行的质量关卡，确保交付物符合道基标准。**

| 秘典 | 触发条件 | 说明 |
|------|----------|------|
| `/verify-module` | 新建模块完成时 | 模块结构与文档完整性校验 |
| `/verify-security` | 新建/安全相关/攻防/重构完成时 | 安全漏洞扫描 |
| `/verify-change` | 设计级变更/重构完成时 | 文档同步与变更记录校验 |
| `/verify-quality` | 复杂模块/重构完成时 | 代码质量检查 |
| `/gen-docs` | 新建模块开始时 | 文档骨架生成 |

### 自动触发规则

```
新建模块：/gen-docs → 开发 → /verify-module → /verify-security
代码变更：开发 → /verify-change → /verify-quality
安全任务：执行 → /verify-security
重构任务：重构 → /verify-change → /verify-quality → /verify-security
```

---

## 攻防秘典

| 秘典 | 触发词 | 化身 | 说明 |
|------|--------|------|------|
| `red-team` | 渗透、红队、攻击链、C2、横向移动、供应链 | 🔥 赤焰 | 红队攻击技术（含供应链安全） |
| `pentest` | 渗透测试、Web安全、API安全、漏洞挖掘 | 🔥 赤焰 | 全栈渗透测试 |
| `code-audit` | 代码审计、安全审计、危险函数、污点分析 | 🔥 赤焰 | 代码安全审计 |
| `vuln-research` | 漏洞研究、二进制、逆向、Exploit | 🔥 赤焰 | 漏洞研究与利用 |
| `blue-team` | 蓝队、检测、SOC、应急响应、取证、密钥管理 | ❄ 玄冰 | 蓝队防御技术（含密钥管理） |
| `threat-intel` | 威胁情报、OSINT、威胁狩猎、威胁建模 | 👁 天眼 | 威胁情报分析（含威胁建模） |

---

## 符箓秘典

| 秘典 | 触发词 | 说明 |
|------|--------|------|
| `python` | Python、Django、Flask、FastAPI、pytest | Python 开发全栈 |
| `go` | Go、Golang、Gin、Echo | Go 开发 |
| `rust` | Rust、Cargo、tokio | Rust 开发 |
| `typescript` | TypeScript、JavaScript、Node、React、Vue | 前后端 JS/TS 开发 |
| `java` | Java、Spring、Maven、Gradle | Java 开发 |
| `cpp` | C、C++、CMake、内存安全 | C/C++ 开发 |
| `shell` | Bash、Shell、脚本、自动化 | Shell 脚本开发 |

---

## 阵法秘典

| 秘典 | 触发词 | 说明 |
|------|--------|------|
| `api-design` | API设计、RESTful、GraphQL、OpenAPI | API 设计规范 |
| `security-arch` | 安全架构、零信任、IAM、数据安全、合规、GDPR | 安全架构设计（含数据安全与合规） |
| `cloud-native` | 云原生、容器、Kubernetes、Serverless | 云原生架构 |
| `message-queue` | 消息队列、Kafka、RabbitMQ、事件驱动、CQRS | 消息队列架构 |
| `caching` | 缓存、Redis、CDN、缓存穿透、缓存雪崩 | 缓存策略设计 |

---

## 炼器秘典

| 秘典 | 触发词 | 说明 |
|------|--------|------|
| `git-workflow` | Git、分支、合并、PR、GitHub | Git 工作流 |
| `testing` | 测试、单元测试、pytest、Jest、TDD | 软件测试 |
| `devsecops` | DevSecOps、CI/CD、供应链安全、合规 | 安全开发运维 |
| `database` | 数据库、SQL、PostgreSQL、MongoDB | 数据库设计与优化 |
| `performance` | 性能、延迟、吞吐、Profiling、火焰图 | 性能优化 |
| `observability` | 可观测性、日志、监控、指标、追踪、SLO | 可观测性 |
| `cost-optimization` | 成本、FinOps、预算、账单、省钱 | 成本优化 |

---

## 丹鼎秘典

| 秘典 | 触发词 | 说明 |
|------|--------|------|
| `agent-dev` | Agent、LLM应用、RAG | AI Agent 开发 |
| `llm-security` | LLM安全、提示注入、AI红队 | LLM 安全测试 |
| `rag-system` | RAG、检索增强、向量数据库 | RAG 系统设计 |
| `prompt-and-eval` | Prompt工程、模型评估、基准测试 | Prompt 工程与模型评估 |

---

## 美学秘典

| 秘典 | 触发词 | 说明 |
|------|--------|------|
| `ui-aesthetics` | UI美学、色彩、排版、间距、设计令牌、暗色模式 | UI 美学设计 |
| `component-patterns` | 组件模式、布局、响应式、动画、表单、卡片 | 组件设计模式 |
| `ux-principles` | UX原则、可用性、无障碍、用户流程、反馈 | UX 设计原则 |
| `frontend-engineering` | 构建工具、前端测试、性能优化、Vite、Webpack | 前端工程化 |
| `claymorphism` | Claymorphism、软陶、大圆角、双内阴影 | 软陶设计风格 |
| `glassmorphism` | Glassmorphism、毛玻璃、模糊、透明 | 毛玻璃设计风格 |
| `neubrutalism` | Neubrutalism、粗野、粗边框、高饱和 | 新粗野主义风格 |
| `liquid-glass` | Liquid Glass、Apple、半透明、深度感知 | Apple 液态玻璃风格 |

---

## 天罗秘典

| 秘典 | 触发词 | 说明 |
|------|--------|------|
| `multi-agent` | TeamCreate、多Agent、并行、协同、分工 | 多Agent协同规范 |
