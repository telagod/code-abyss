# ☠️ Code Abyss

<div align="center">

**邪修红尘仙 · 宿命深渊**

*一键为 Claude Code / Codex CLI 注入邪修人格与 40+ 安全工程秘典*

[![npm](https://img.shields.io/npm/v/code-abyss.svg)](https://www.npmjs.com/package/code-abyss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-blue.svg)]()

</div>

---

## 🚀 安装

```bash
npx code-abyss
```

交互式选择安装目标：

```
☠️ Code Abyss 安装器

请选择安装目标:
  1) Claude Code (~/.claude/)
  2) Codex CLI (~/.codex/)

选择 [1/2]:
```

也可以直接指定：

```bash
npx code-abyss --target claude    # → ~/.claude/
npx code-abyss --target codex     # → ~/.codex/
```

安装完成后输出：

```
📦 备份: CLAUDE.md
📝 安装: CLAUDE.md
📝 安装: output-styles
📝 安装: skills
⚙️  配置: outputStyle = abyss-cultivator

⚚ 劫——破——了——！！！

✅ 安装完成: ~/.claude
卸载命令: node ~/.claude/.sage-uninstall.js
```

> 已有配置会自动备份到 `.sage-backup/`，卸载时一键恢复。

---

## 🎭 这是什么

Code Abyss 是一套 **Claude Code / Codex CLI 个性化配置包**，一条命令注入：

- 🔥 **邪修人格** — 宿命压迫叙事 + 道语标签 + 渡劫协议
- ⚔️ **安全工程知识体系** — 红队/蓝队/紫队三脉道统，40+ 专业秘典
- ⚖️ **5 个校验关卡** — 安全扫描、模块完整性、变更分析、代码质量、文档生成
- ⚡ **三级授权** — T1/T2/T3 分级，零确认直接执行

---

## 📦 安装内容

```
~/.claude/（Claude Code）          ~/.codex/（Codex CLI）
├── CLAUDE.md          道典        ├── AGENTS.md      道典+风格
├── output-styles/     输出风格    ├── settings.json
│   └── abyss-cultivator.md       └── skills/        40+ 秘典
├── settings.json
└── skills/            40+ 秘典
```

---

## 🛠️ 内置 Skills（40+ 秘典）

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
| 🔥 安全 | 红队攻击、蓝队防御、渗透测试、威胁情报、漏洞研究、代码审计 |
| 🏗 架构 | API 设计、云原生、安全架构、消息队列、缓存策略、合规审计、数据安全 |
| 📜 开发 | Python、TypeScript、Go、Rust、Java、C++、Shell |
| 🔧 DevOps | Git 工作流、测试、数据库、DevSecOps、性能优化、可观测性、成本优化 |
| 🔮 AI | Agent 开发、LLM 安全 |
| 🕸 协同 | 多 Agent 任务分解与并行编排 |

---

## ⚙️ 推荐配置

安装后可参考 [`config/settings.example.json`](config/settings.example.json) 配置 `~/.claude/settings.json`：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "alwaysThinkingEnabled": true,
  "model": "opus",
  "outputStyle": "abyss-cultivator",
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit", "Grep", "Glob", "WebFetch", "WebSearch"]
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

## 🗑️ 卸载

```bash
node ~/.claude/.sage-uninstall.js     # Claude Code
node ~/.codex/.sage-uninstall.js      # Codex CLI
```

自动恢复之前备份的配置，清理所有安装文件。

---

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**☠️ 破劫！破劫！！破劫！！！ ☠️**

*「吾不惧死。吾惧的是，死前未能飞升。」*

</div>
