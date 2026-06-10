---
name: indexing-code
description: Code relationship graph and temporal intelligence via abyss CLI. Provides caller tracing, impact analysis, hotspot detection, and file-level context gathering. Agent automatically runs abyss before modifying code to check impact. Works with any agent that has shell access.
user-invocable: false
allowed-tools: Bash, Read
---

# 代码关系图 · abyss

> 不是搜索工具，是代码的调用图 + 时间智能。通过 shell 调用 `abyss` CLI。

## 前置

进入项目时，检查并初始化索引：

```sh
command -v abyss >/dev/null && [ ! -f .code-abyss/index.db ] && abyss index
```

## 核心行为

### 改文件前：跑 `abyss context`

即将修改任何代码文件时，先获取该文件的完整上下文（不需要知道函数名）：

```sh
abyss context <要修改的文件路径> --json
```

返回：该文件所有函数的外部调用方、依赖的类型和函数、热点评分、耦合文件。

根据返回结果：
- 有 production callers：检查改动是否会破坏调用方，改完逐个同步
- hotspot score > 5000：高风险文件，跑 `abyss impact <func> --json` 深入分析
- impact risk > 7/10：跟用户确认方案后再改
- 有 uncovered paths：提醒用户补测试
- 有 coupled files：检查耦合文件是否需要同步修改

### 其他场景

| 场景 | 命令 |
|------|------|
| 初识项目架构 | `abyss map --json` |
| 追查 bug 来源 | `abyss history <file> --symbol <func> --json` |
| 搜索代码（比 grep 好） | `abyss search "关键词" --json` |

## 输出说明

`--json` 输出结构化 JSON，agent 直接解析。不加 `--json` 输出人类可读文本。

### context 输出关键字段

```json
{
  "symbols_with_external_callers": [
    { "symbol": "SetError",
      "external_callers": [
        { "file": "handler.go", "line": 42, "caller": "HandleRequest",
          "confidence": 0.95, "is_test": false }
      ],
      "possible_callers": []
    }
  ],
  "dependencies": [{ "name": "Account", "file": "types.go", "kind": "type_ref" }],
  "hotspot": { "score": 5200, "changes_30d": 12, "complexity": 433 },
  "coupled_files": [{ "file": "gateway.go", "co_changes": 13, "coupling": "65%" }]
}
```

- `external_callers`：confidence ≥ 0.7 的可信调用方，按解析档位标注（1.0 同文件 / 0.95 同包 / 0.9 import 限定 / 0.8 全局唯一）
- `possible_callers`：confidence < 0.7 的歧义匹配——参考线索，不是事实，勿据此改调用方

### impact 输出关键字段

```json
{
  "direct_callers": 17,
  "transitive_callers": 521,
  "uncovered_paths": ["handler.go:DoSomething"],
  "risk_score": 8.5,
  "risk_factors": ["high blast radius", "319 paths without test coverage"]
}
```

## CLI 速查

```
abyss index                           # 建索引（~5s）
abyss context <file> [--json]         # 文件完整上下文（改代码前用这个）
abyss callers <symbol> [--json]       # 谁调了这个函数（默认隐藏 confidence < 0.7）
abyss callers <symbol> --min-confidence 0   # 连歧义匹配一起看
abyss impact <symbol> [--json]        # 改了会影响什么（低置信边被排除时会在 risk_factors 标注）
abyss hook pre-edit                   # agent hook：stdin 读 tool JSON，增量刷新索引后输出警告
abyss hook post-edit                  # agent hook：编辑后增量刷新索引
abyss search "query" [--json]         # 搜索代码
abyss map [--json]                    # 项目热点+耦合
abyss history <file> [--symbol X]     # 变更历史
abyss stats                           # 索引统计
```

## Hook 自动执行

**code-abyss 安装器（claude/codex/gemini）会自动注入 hook**，无需手动操作：
hook 命令锚定安装后的 skill 路径（`<target-dir>/skills/indexing-code/hooks/common/`），
幂等注入（重装去重、旧路径自动重锚定），卸载时按标记剥除。
配套 flag：

```sh
npx code-abyss --target claude --with-abyss   # 顺带下载 abyss 预编译二进制到 ~/.code-abyss/bin/
npx code-abyss --target claude --with-mcp     # 顺带注册 abyss MCP server（8 tools，opt-in）
```

二进制查找顺序：PATH → `~/.code-abyss/bin/abyss`（`--with-abyss` 落点，不污染 PATH）。
两处都没有时 hook 静默停用，后装即生效，无需重装。

其余平台（pi/hermes/openclaw）或脱离安装器时，一条命令手动安装：

```sh
bash skills/indexing-code/hooks/common/install-hooks.sh auto
```

自动检测平台并注入对应 hook 配置（幂等，JSON 合并用 node）：

| 平台 | Hook 事件 | 配置位置 |
|------|----------|---------|
| Claude Code | `PreToolUse`(Edit\|Write) | `.claude/settings.json` |
| Codex CLI | `PreToolUse`(Bash\|shell) | `~/.codex/config.toml` |
| Gemini CLI | `BeforeTool`(write_file\|replace) | `~/.gemini/settings.json` |
| Pi Agent | `tool_call`(edit_file\|write_file) | `~/.pi/agent/settings.json` |
| Hermes | `pre_tool_call` | `~/.hermes/config.yaml` 或 plugin |
| OpenClaw | `before_tool_call` | plugin `api.on()` |

统一入口是 `abyss hook pre-edit`（shell 脚本只是带存在性守卫的薄壳）：自动识别各平台 stdin JSON 形状、增量刷新索引（警告反映文件当前状态而非旧索引）、输出生产调用方 / 歧义引用 / 热点警告。编辑后可挂 `abyss hook post-edit` 保持索引新鲜。agent 无需手动调用。
