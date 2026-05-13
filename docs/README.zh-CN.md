# Code Abyss

<div align="center">

*为 Claude Code / Codex CLI / Gemini CLI / OpenClaw 打造的人格驱动配置系统*

[![npm](https://img.shields.io/npm/v/code-abyss.svg)](https://www.npmjs.com/package/code-abyss)
[![CI](https://github.com/telagod/code-abyss/actions/workflows/ci.yml/badge.svg)](https://github.com/telagod/code-abyss/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-blue.svg)]()
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)]()

</div>

Code Abyss 为你的 AI 编程 CLI 注入可切换的人格 + 输出风格 + 工程技能体系。一条命令即可配置人格规则、主动执行导向、输出风格、26 个领域技能和 5 个校验工具，覆盖 Claude Code、Codex CLI、Gemini CLI 与 OpenClaw。

## 快速开始

```bash
npx code-abyss                          # 交互式菜单
npx code-abyss --target claude -y       # 一键安装到 ~/.claude/
npx code-abyss --target codex -y        # 一键安装到 ~/.codex/
npx code-abyss --target gemini -y       # 一键安装到 ~/.gemini/
npx code-abyss --target openclaw -y     # 一键安装到 ~/.openclaw/
```

## 功能概述

Code Abyss 是一个三层配置系统：

| 层级 | 内容 | 位置 |
|------|------|------|
| 人格 | 角色身份、规则、执行链 | `config/personas/*.md` + `config/CLAUDE.md` |
| 输出风格 | 语气、格式、回复结构 | `output-styles/*.md` + `index.json` |
| 技能 | 领域知识 + 可执行校验工具 | `skills/**/*.md` + `scripts/*.js` |

安装器为每个 CLI 生成对应的产物：

| 目标 | 配置 | 技能 | 风格 |
|------|------|------|------|
| Claude | `~/.claude/CLAUDE.md` + `settings.json` | `~/.claude/commands/*.md` + `~/.claude/skills/` | `settings.json.outputStyle` |
| Codex | `~/.codex/config.toml` + `AGENTS.md` | `~/.codex/skills/` | `~/.codex/AGENTS.md` |
| Gemini | `~/.gemini/GEMINI.md` + `settings.json` | `~/.gemini/commands/*.toml` + `~/.gemini/skills/` | `GEMINI.md` |
| OpenClaw | `~/.openclaw/openclaw.json` + `<workspace>/AGENTS.md` + `<workspace>/SOUL.md` | `~/.openclaw/skills/` | `SOUL.md` |

Codex 配置现在内置显式预设：`full_auto`（`workspace-write` + `on-request`）与 `full_access`（`danger-full-access` + `on-request`）。需要完整文件系统访问时使用 `codex -p full_access`，不再依赖已移除的 UI 预设。

## 人格系统

5 个可切换人格，各有独特的性格、交互风格，并共享“主动补位、顺手闭环”的执行倾向：

| 标识 | 名称 | 风格特点 |
|------|------|----------|
| `abyss`（默认） | 邪修红尘仙 | 直接、安全优先、主动收口 |
| `scholar` | 文言小生 | 古典、严谨、主动校勘 |
| `elder-sister` | 知性大姐姐 | 温柔、洞察、主动护栏 |
| `junior-sister` | 古怪精灵小师妹 | 活泼、敏锐、主动推进 |
| `iron-dad` | 铁壁暖阳 | 果断、温暖、主动兜底 |

安装时切换人格：

```bash
npx code-abyss --target claude --persona elder-sister -y
```

## 输出风格

5 个输出风格控制语气和回复格式：

| 标识 | 名称 | 适用场景 |
|------|------|----------|
| `abyss-cultivator`（默认） | 宿命深渊 | 沉浸式、高张力输出 |
| `scholar-classic` | 墨渊书阁 | 正式、结构化分析 |
| `elder-sister-gentle` | 星霜雅筑 | 温柔、循序渐进引导 |
| `junior-sister-spark` | 灵犀洞天 | 快节奏、活泼互动 |
| `iron-dad-warm` | 钢铁柔情 | 果断、温暖指导 |

安装时切换风格：

```bash
npx code-abyss --target claude --style scholar-classic -y
npx code-abyss --list-styles    # 列出所有可用风格
```

## 技能体系

26 个技能覆盖 15 个领域，以 `SKILL.md` frontmatter 为单一事实源。

### 用户调用

核心技能默认按上下文自动路由，**不再默认暴露斜杠命令**。运行时会倾向于主动完成最近的安全闭环：检查、实现、验证、汇报。校验工具在需要时仍可直接从仓库执行。

### 领域知识（按上下文自动加载）

| 领域 | 覆盖范围 |
|------|----------|
| 安全 | 渗透测试、代码审计、防御工程、威胁情报、漏洞研究 |
| Coff0xc 安全扩展 | AppSec、云/DevSecOps、检测响应、漏洞生命周期、身份零信任、授权评估、逆向/移动/IoT、区块链、合规架构、紫队、网络协议安全 |
| 架构 | API 设计、云原生、安全架构、消息队列、缓存策略 |
| 开发 | Python、TypeScript、Go、Rust、Java、C++、Shell |
| DevOps | Git 工作流、测试、数据库、可观测性、性能、成本优化 |
| 前端 | 组件模式、状态管理、UI 美学、4 种设计系统变体 |
| 移动端 | iOS/SwiftUI、Android/Compose、React Native、Flutter |
| AI | Agent 开发、LLM 安全、RAG 系统、Prompt 工程 |
| Office 文档 | Word、PDF、PowerPoint、Excel、OOXML、表单与表格自动化 |
| 数据工程 | 管道编排、流处理、数据质量 |
| 基础设施 | Kubernetes、GitOps、IaC（Terraform/Pulumi/CDK） |
| 协同 | 多 Agent 任务分解与并行编排 |

## 安装布局

```
~/.claude/                          ~/.codex/
├── CLAUDE.md        (人格)         ├── AGENTS.md       (人格 + 风格)
├── output-styles/   (风格文件)     ├── instruction.md   (核心指令)
├── commands/*.md    (可选命令)     ├── skills/          (领域技能)
├── skills/          (领域技能)     ├── bin/lib/          (运行时库)
├── bin/lib/         (运行时库)     ├── config.toml      (推荐配置)
├── settings.json    (配置)         └── .sage-uninstall.js
└── .sage-uninstall.js
~/.gemini/
├── GEMINI.md        (人格 + 风格)
├── commands/*.toml  (可选命令)
├── skills/          (领域技能)
├── settings.json    (配置)
└── .sage-uninstall.js
~/.openclaw/                      <workspace>/
├── openclaw.json   (可选)        ├── AGENTS.md       (规则 / 路由)
├── skills/         (共享技能)    └── SOUL.md         (人格 + 风格)
└── .sage-uninstall.js
```

所有安装文件记录在 `.sage-backup/manifest.json` 中，卸载时自动恢复原有状态。

## 命令参考

```bash
# 安装
npx code-abyss --target <claude|codex|gemini|openclaw> [-y]
npx code-abyss --target claude --style <slug> --persona <slug> -y

# 卸载
npx code-abyss --uninstall <claude|codex|gemini|openclaw>

# 查看
npx code-abyss --list-styles
npx code-abyss --help

# 校验工具（直接运行）
node skills/tools/verify-security/scripts/security_scanner.js <路径>
node skills/tools/verify-module/scripts/module_scanner.js <路径>
node skills/tools/verify-change/scripts/change_analyzer.js --mode staged
node skills/tools/verify-quality/scripts/quality_checker.js <路径>
node skills/tools/gen-docs/scripts/doc_generator.js <路径>
```

## Pack 系统

Code Abyss 支持可安装的 pack 扩展功能：

- `packs/abyss/manifest.json` — 核心包：人格、风格、技能、运行时库
- `packs/gstack/manifest.json` — 可选的固定版本上游 gstack 运行时（仅在 `packs.lock` 声明时安装）
- `.code-abyss/packs.lock.json` — 项目级 pack 声明，支持 `required`/`optional`/`sources`

Pack 管理：

```bash
node bin/packs.js bootstrap              # 初始化 packs.lock
node bin/packs.js bootstrap --apply-docs # 将 pack 文档写入 README/CONTRIBUTING
node bin/packs.js diff                   # 查看 lock 与模板的差异
node bin/packs.js vendor-pull <pack>     # 拉取上游到 .code-abyss/vendor/
node bin/packs.js vendor-sync --check    # CI 门禁：验证 vendor 完整性
node bin/packs.js report summary         # 查看安装报告
node bin/packs.js uninstall <pack>       # 移除 pack 产物
```

## 技能注册表

`skills/**/SKILL.md` frontmatter 是单一事实源。共享注册表（`bin/lib/skill-registry.js`）标准化元数据后供安装器和运行时消费。

必填 frontmatter：

```yaml
---
name: verify-quality          # kebab-case，全局唯一
description: 代码质量校验关卡
user-invocable: false          # true 才会生成显式命令；当前核心默认不暴露
allowed-tools: Bash, Read, Glob  # 可选，默认 Read
argument-hint: <路径>          # 可选
---
```

生成链：

1. 注册表扫描并校验所有 `skills/**/SKILL.md`
2. 仅 `user-invocable: true` 的 skill 会生成命令（当前核心默认无显式命令）
3. Claude：仅在存在可调用 skill 时渲染 `~/.claude/commands/*.md`
4. Codex：安装到 `~/.codex/skills/`，并由生成的 `AGENTS.md` + `instruction.md` 提供主动执行导向
5. Gemini：仅在存在可调用 skill 时渲染 `~/.gemini/commands/*.toml`，并由生成的 `GEMINI.md` 提供主动执行导向
6. OpenClaw：将共享 skills 安装到 `~/.openclaw/skills/`，并把运行时规则 / 人格写入 workspace 的 `AGENTS.md` + `SOUL.md`
7. 脚本型技能通过 `skills/run_skill.js` 执行（加锁 + spawn + 退出码透传）
8. 知识型技能直接加载 `SKILL.md` 内容

## 开发

```bash
npm test                          # Jest 测试套件
npm run verify:skills             # 校验 SKILL.md frontmatter 契约
node bin/install.js --help        # 安装器帮助
```

CI 在 Node 18/20/22 + Linux/macOS/Windows 上运行：

- 单元测试 + 技能契约校验
- 4 个校验工具（安全、模块、质量、变更）
- 三端三平台 smoke 安装/卸载测试

## 卸载

```bash
npx code-abyss --uninstall claude
npx code-abyss --uninstall codex
npx code-abyss --uninstall gemini
npx code-abyss --uninstall openclaw
```

自动恢复备份的配置，清理所有安装文件。

## 许可证

Code Abyss 使用 [MIT](../LICENSE) 许可证。

Coff0xc 安全扩展包含改写自 `coffee-skill` 的 Apache-2.0 内容；见 [NOTICE.coff0xc-security.md](../NOTICE.coff0xc-security.md) 和 [THIRD_PARTY_LICENSES/Apache-2.0-coffee-skill.txt](../THIRD_PARTY_LICENSES/Apache-2.0-coffee-skill.txt)。
