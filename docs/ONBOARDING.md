# 新维护者上手指南

> 适用对象：第一次接手 Code Abyss 的维护者  
> 目标：30 分钟内建立“能跑、能找、能改、能验”的基本能力

## 先知道这是什么

Code Abyss 不是普通的 Markdown 配置仓库。它是一个安装器项目，负责把 persona、output styles、skills、packs 安装到多个 AI CLI 运行时目录。

你接手后要维护的通常不是某一份文档，而是下面这条链：

`registry / config -> installer -> target runtime -> tests -> docs`

## 第一天必须完成的事

### 1. 安装依赖

```bash
npm ci
```

### 2. 跑完整测试

```bash
npm test
```

### 3. 跑 skill 合约校验

```bash
npm run verify:skills
```

### 4. 看 CLI 帮助，确认对外接口

```bash
node bin/install.js --help
node bin/install.js --list-styles
node bin/install.js --list-personas
```

### 5. 读关键文档

1. [../README.md](../README.md)
2. [../DESIGN.md](../DESIGN.md)
3. [PACK_SYSTEM.md](./PACK_SYSTEM.md)
4. [SKILL_AUTHORING.md](./SKILL_AUTHORING.md)

## 你会经常碰到的目录

| 目录 / 文件 | 什么时候看 |
| --- | --- |
| `bin/install.js` | 找安装总流程 |
| `bin/adapters/` | 看某个目标 CLI 的特化逻辑 |
| `bin/lib/skill-registry.js` | 查 skill 元数据如何被收集与校验 |
| `bin/lib/style-registry.js` | 查 style / persona registry 与 runtime guidance |
| `packs/*/manifest.json` | 查某个 pack 的 host 安装契约 |
| `.code-abyss/packs.lock.json` | 查当前项目启用了哪些 pack |
| `skills/**/SKILL.md` | 查 skill 的权威元数据 |
| `test/install-smoke.test.js` | 查安装行为的事实回归 |
| `test/docs-drift.test.js` | 查哪些文档口径已经被防漂移约束 |

## 先别做错的事

- 不要先改 README 再去猜代码行为。
- 不要手工维护 skill 数量、style 数量之类容易漂移的展示信息。
- 不要只看 `bin/install.js`，目标差异大多在 `bin/adapters/*`。
- 不要直接在真实 `~/.claude` / `~/.codex` / `~/.gemini` 上做冒险验证。

## 安全做手动安装验证

### PowerShell

```powershell
$tmp = Join-Path $env:TEMP "code-abyss-home"
New-Item -ItemType Directory -Force $tmp | Out-Null
$env:HOME = $tmp
$env:USERPROFILE = $tmp
node bin/install.js --target codex -y
```

### Bash

```bash
tmp_home="$(mktemp -d)"
HOME="$tmp_home" USERPROFILE="$tmp_home" node bin/install.js --target codex -y
```

这样可以避免污染你真实的本地 AI CLI 配置。

## 常见维护任务怎么落地

### 改一个 skill

1. 找到 `skills/<category>/<name>/SKILL.md`
2. 如果是脚本型 skill，检查 `scripts/*.js` 是否只有一个入口
3. 跑：

```bash
npm run verify:skills
npm test -- --runInBand test/run-skill.test.js test/install-generation.test.js
```

### 改一个 style 或 persona

1. 改 registry：`output-styles/index.json` 或 `config/personas/index.json`
2. 改对应 `.md` 文件
3. 跑：

```bash
npm test -- --runInBand test/style-registry.test.js
```

### 改 pack 行为

1. 改 `packs/*/manifest.json`
2. 需要时改 `.code-abyss/packs.lock.json`
3. 跑：

```bash
npm run packs:check
npm test -- --runInBand test/pack-registry.test.js test/packs-cli.test.js
```

### 改文档

1. 先确认源码和测试里的真实行为
2. 再改 `README.md` / `DESIGN.md` / `docs/*.md`
3. 跑：

```bash
npm test -- --runInBand test/docs-drift.test.js
```

## 回归测试怎么选

| 改动类型 | 最低回归 |
| --- | --- |
| 文档口径 | `test/docs-drift.test.js` |
| style / persona | `test/style-registry.test.js` |
| 安装流程 | `test/install-smoke.test.js` |
| skill registry / command generation | `test/install-generation.test.js`、`test/run-skill.test.js` |
| pack registry / lock / CLI | `test/pack-registry.test.js`、`test/packs-cli.test.js` |

## 新人最容易迷路的三个点

### 1. Codex 到底装什么

不要只盯着 `~/.codex/AGENTS.md`。Codex 运行时还依赖：

- `config.toml`
- `instruction.md`
- `skills/`
- `~/.agents/skills/` 下的外部 pack runtime

### 2. pack manifest 和 packs.lock 的关系

- manifest 说的是“这个 pack 能怎么装”
- lock 说的是“这个项目决定装什么”

### 3. 文档与行为冲突时听谁的

先信源码和测试，再回头修文档。不要反过来。

## 交接时应当留下什么

- 改了哪些入口文件
- 用哪几个测试验证
- 有无新增文档或文档口径变化
- 是否引入新的 drift 风险

如果这些信息没留下，下一个接手的人还会重新掉进同一层坑里。
