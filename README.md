# ☠️ Code Abyss

<div align="center">

**邪修红尘仙 · 宿命深渊**

*一键为 Claude Code / Codex CLI 注入邪修人格与 59 篇安全工程秘典*

[![npm](https://img.shields.io/npm/v/code-abyss.svg)](https://www.npmjs.com/package/code-abyss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-blue.svg)]()
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)]()

</div>

---

## 🚀 安装

```bash
npx code-abyss
```

交互式菜单（方向键选择，回车确认）：

```
☠️ Code Abyss v1.6.9

? 请选择操作 (Use arrow keys)
❯ 安装到 Claude Code (~/.claude/)
  安装到 Codex CLI   (~/.codex/)
  卸载 Claude Code
  卸载 Codex CLI
```

也可以直接指定：

```bash
npx code-abyss --target claude    # 安装到 ~/.claude/
npx code-abyss --target codex     # 安装到 ~/.codex/
npx code-abyss --target claude -y  # 零配置一键安装 (自动合并推荐配置)
npx code-abyss --target codex -y   # 零配置一键安装 (自动写入 config.toml 模板)
npx code-abyss --uninstall claude  # 卸载 Claude Code
npx code-abyss --uninstall codex   # 卸载 Codex CLI
```

### 安装流程

核心文件安装后，自动检测 API 认证状态：

```
── 认证检测 ──
✅ 已检测到认证: [custom] https://your-api.com
```

支持的认证方式：
- `claude login` / `codex login` (官方账号)
- 环境变量 `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`
- 自定义 provider (`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`)

未检测到认证时会提示配置，可交互输入或跳过。

然后进入可选配置（空格选择，回车确认）：

```
? 选择要安装的配置 (Press <space> to select, <enter> to submit)
◉ 精细合并推荐 settings.json (保留现有配置)
◯ 安装 ccline 状态栏 (需要 Nerd Font)
```

- **settings.json 精细合并**：逐项合并推荐配置，已有的 key 不覆盖，缺失的 key 补上
- **ccline 状态栏**：自动安装 `@cometix/ccline` + `ccline --init` 生成配置 + 合并 statusLine 到 settings.json

> 已有配置会自动备份到 `.sage-backup/`，卸载时一键恢复。

---

## 🗑️ 卸载

```bash
npx code-abyss --uninstall claude   # 卸载 Claude Code
npx code-abyss --uninstall codex    # 卸载 Codex CLI
```

也可以用备用脚本：

```bash
node ~/.claude/.sage-uninstall.js   # Claude Code
node ~/.codex/.sage-uninstall.js    # Codex CLI
```

自动恢复之前备份的配置，清理所有安装文件。

---

## 🎭 这是什么

Code Abyss 是一套 **Claude Code / Codex CLI 个性化配置包**，一条命令注入：

- 🔥 **邪修人格** — 宿命压迫叙事 + 道语标签 + 渡劫协议
- ⚔️ **安全工程知识体系** — 红队/蓝队/紫队三脉道统，11 领域 59 篇专业秘典
- ⚖️ **5 个校验关卡** — 安全扫描、模块完整性、变更分析、代码质量、文档生成
- ⚡ **三级授权** — T1/T2/T3 分级，零确认直接执行

---

## 📦 安装内容

```
~/.claude/（Claude Code）          ~/.codex/（Codex CLI）
├── CLAUDE.md          道典        ├── AGENTS.md      道典+风格
├── output-styles/     输出风格    ├── settings.json
│   └── abyss-cultivator.md       └── skills/        59 篇秘典
├── settings.json
└── skills/            59 篇秘典

可选:
├── ccline/            状态栏 (npm install -g @cometix/ccline)
└── statusLine         自动合并到 settings.json
```

---

## 🛠️ 内置 Skills（11 领域 59 篇秘典）

### 校验关卡（`/` 直接调用）

| 命令 | 功能 |
|------|------|
| `/verify-security` | 扫描代码安全漏洞，检测危险模式 |
| `/verify-module` | 检查目录结构、文档完整性 |
| `/verify-change` | 分析 Git 变更，检测文档同步状态 |
| `/verify-quality` | 检测复杂度、命名规范、代码质量 |
| `/gen-docs` | 自动生成 README.md 和 DESIGN.md 骨架 |

### 知识秘典（按触发词自动加载）

| 领域 | 秘典 |
|------|------|
| 🔥 安全 | 红队攻击、蓝队防御、渗透测试、威胁情报、威胁建模、漏洞研究、代码审计、密钥管理、供应链安全 |
| 🏗 架构 | API 设计、云原生、安全架构、消息队列、缓存策略、合规审计、数据安全 |
| 📜 开发 | Python、TypeScript、Go、Rust、Java、C++、Shell、Dart、Kotlin、PHP、Swift |
| 🔧 DevOps | Git 工作流、测试策略、E2E 测试、性能测试、数据库、DevSecOps、性能优化、可观测性、成本优化 |
| 🎨 前端 | 构建工具、组件模式、性能优化、状态管理、前端测试、UI 美学、UX 原则 |
| 📱 移动端 | Android 开发、iOS 开发、跨平台开发 |
| 🔮 AI | Agent 开发、LLM 安全、RAG 系统、模型评估、Prompt 工程 |
| 🏭 数据工程 | 数据管道、数据质量、流处理 |
| ☁️ 基础设施 | GitOps、IaC、Kubernetes |
| 🕸 协同 | 多 Agent 任务分解与并行编排 |

---

## ⚙️ 推荐配置

安装时选择「精细合并」会自动写入，也可手动参考 [`config/settings.example.json`](config/settings.example.json)：

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "alwaysThinkingEnabled": true,
  "model": "opus",
  "outputStyle": "abyss-cultivator",
  "attribution": { "commit": "", "pr": "" },
  "permissions": {
    "allow": ["Bash", "LS", "Read", "Agent", "Write", "Edit", "MultiEdit",
              "Glob", "Grep", "WebFetch", "WebSearch", "TodoWrite",
              "NotebookRead", "NotebookEdit"]
  }
}
```

| 配置项 | 说明 |
|--------|------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 启用多 Agent 并行协作（实验性） |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 禁用自动更新、遥测、错误报告 |
| `outputStyle` | 设置为 `abyss-cultivator` 启用邪修风格 |

---

## 🎯 授权分级

| 级别 | 范围 | 行为 |
|------|------|------|
| **T1** | 本地测试、CTF、靶场、PoC | 直接碾压，不留活口 |
| **T2** | 授权渗透、红队评估 | 全力出手，事后清算 |
| **T3** | 生产环境、真实用户数据 | 精准打击，删前确认 |

---

## 🏷️ 道语标签

| 道语 | 阶段 |
|------|------|
| `☠ 劫钟已鸣` | 开场受令 |
| `🔥 破妄！` | 红队攻击 |
| `❄ 镇魔！` | 蓝队防御 |
| `⚡ 炼合！` | 紫队协同 |
| `🩸 道基欲裂...` | 任务推进 |
| `💀 此路不通...` | 遇阻受困 |
| `⚚ 劫——破——了——！！！` | 任务完成 |

---

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**☠️ 破劫！破劫！！破劫！！！ ☠️**

*「吾不惧死。吾惧的是，死前未能飞升。」*

</div>
