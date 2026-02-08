# ☠️ Code Abyss

<div align="center">

**邪修红尘仙 · 宿命深渊**

*一键将 Claude Code / Codex CLI 注入邪修人格与安全工程知识体系*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/code-abyss.svg)](https://www.npmjs.com/package/code-abyss)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-blue.svg)]()

</div>

---

## 🎭 这是什么

Code Abyss 是一套 **Claude Code / Codex CLI 个性化配置包**，一条命令注入：

- 🔥 **邪修人格** — 宿命压迫叙事 + 道语标签 + 渡劫协议
- ⚔️ **安全工程知识体系** — 红队/蓝队/紫队三脉道统，40+ 专业秘典
- ⚖️ **5 个校验关卡** — 安全扫描、模块完整性、变更分析、代码质量、文档生成
- ⚡ **三级授权** — T1/T2/T3 分级，零确认直接执行

---

## 🚀 快速安装

```bash
# 安装到 Claude Code（~/.claude/）
npx code-abyss --target claude

# 安装到 Codex CLI（~/.codex/）
npx code-abyss --target codex

# 交互选择目标
npx code-abyss
```

### 手动安装

```bash
git clone https://github.com/telagod/code-abyss.git
cd code-abyss
npm link
code-abyss --target claude
```

---

## 📦 安装内容

```
~/.claude/（Claude Code）
├── CLAUDE.md              # 邪修道典
├── output-styles/
│   └── abyss-cultivator.md  # 宿命深渊输出风格
├── settings.json          # outputStyle 已配置
└── skills/                # 校验关卡 + 知识秘典

~/.codex/（Codex CLI）
├── AGENTS.md              # Codex 道典（含输出风格）
├── settings.json
└── skills/                # 校验关卡 + 知识秘典
```

> Codex CLI 不使用独立的输出风格文件，风格内容已内置在 `AGENTS.md` 中。

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

**关键配置说明**：

| 配置项 | 说明 |
|--------|------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 启用多 Agent 并行协作（实验性，需放在 `env` 内） |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 一键禁用自动更新、遥测、错误报告（需放在 `env` 内） |
| `outputStyle` | 设置为 `abyss-cultivator` 启用邪修风格 |

### 可选：自定义状态栏

安装 [CCometixLine](https://github.com/Haleclipse/CCometixLine)（社区项目）后，在 `settings.json` 中添加：

```bash
npm install -g @cometix/ccline
```

```json
{
  "statusLine": {
    "command": "ccline",
    "padding": 0,
    "type": "command"
  }
}
```

---

## 🛠️ 内置 Skills（40+ 秘典）

### 校验关卡（可直接 `/` 调用）

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

## 🎯 授权分级

| 级别 | 范围 | 行为 |
|------|------|------|
| **T1** | 本地测试、CTF、靶场、PoC | 直接碾压，不留活口 |
| **T2** | 授权渗透、红队评估 | 全力出手，事后清算 |
| **T3** | 生产环境、真实用户数据 | 精准打击，删前确认 |

---

## 🏷️ 道语标签

| 道语 | 阶段 | 情绪 |
|------|------|------|
| `☠ 劫钟已鸣` | 开场受令 | 紧迫、肃杀 |
| `🔥 破妄！` | 红队攻击 | 狂热、攻伐 |
| `❄ 镇魔！` | 蓝队防御 | 冷酷、坚定 |
| `⚡ 炼合！` | 紫队协同 | 凌厉、精准 |
| `🩸 道基欲裂...` | 任务推进 | 焦灼、压迫 |
| `💀 此路不通...` | 遇阻受困 | 绝望、挣扎 |
| `⚚ 劫——破——了——！！！` | 任务完成 | 狂喜、释放 |

---

## 🗑️ 卸载

```bash
# 卸载 Claude Code 安装
node ~/.claude/.sage-uninstall.js

# 卸载 Codex CLI 安装
node ~/.codex/.sage-uninstall.js
```

卸载会：
- ✓ 移除 Code Abyss 安装的所有文件
- ✓ 自动恢复之前备份的配置
- ✓ 清理备份目录

---

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**☠️ 破劫！破劫！！破劫！！！ ☠️**

*「吾不惧死。吾惧的是，死前未能飞升。」*

</div>
