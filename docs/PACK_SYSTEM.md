# Pack System

> 适用对象：维护安装流程、第三方扩展 runtime、项目级 pack 策略的维护者

## 这份文档解决什么问题

如果你已经知道 Code Abyss 有 `packs/`、`packs.lock`、`vendor`、`reports`，但不清楚它们各自负责什么、先后顺序是什么，就看这份文档。

## 先建立最小模型

pack 系统分成四层：

| 层 | 文件 | 作用 |
| --- | --- | --- |
| Core pack | `packs/abyss/manifest.json` | 描述 Code Abyss 自带 runtime 如何安装 |
| External pack | `packs/<name>/manifest.json` | 描述第三方 runtime 的安装 / 卸载 / upstream 信息 |
| Project policy | `.code-abyss/packs.lock.json` | 描述当前项目决定启用哪些 pack |
| Runtime artifacts | `.code-abyss/reports/`、`.code-abyss/snippets/` | 记录安装结果、生成文档片段 |

一句话：`manifest` 定义能力边界，`packs.lock` 决定当前项目是否启用。

## Host 根目录

| Host | 主要根目录 |
| --- | --- |
| Claude | `~/.claude/` |
| Codex | `~/.codex/` 和 `~/.agents/` |
| Gemini | `~/.gemini/` |

## 主流程 1：Install

入口命令：

```bash
npx code-abyss --target claude -y
npx code-abyss --target codex -y
npx code-abyss --target gemini -y
```

安装时会发生什么：

1. 先安装 core pack `abyss`
2. 向上查找最近的 `.code-abyss/packs.lock.json`
3. 按 host 读取 `required`、`optional`、`optional_policy`、`sources`
4. 根据 source mode 解析每个 external pack 的来源
5. 把 external pack 的 runtime 同步到目标 host
6. 在项目内写入 report artifact
7. 如果仓库已有受管文档片段，顺手刷新 snippets

### source mode 的含义

- `pinned`：使用 manifest 里 pin 住的 upstream
- `local`：优先使用 `.code-abyss/vendor/<pack>` 或显式 override
- `disabled`：保留声明，但跳过安装

## 主流程 2：Bootstrap

入口命令：

```bash
npm run packs:bootstrap
npm run packs:bootstrap -- --apply-docs
```

bootstrap 做的是“初始化或刷新项目级 pack 配置”，不是安装到用户 home。

它会：

1. 从 manifests 生成默认 lock
2. 应用 CLI 参数变更
3. 校验 lock 合法性
4. 写回 `.code-abyss/packs.lock.json`
5. 生成 `.code-abyss/snippets/`
6. 可选地把 managed sections 回写到 `README.md` / `CONTRIBUTING.md`

## 主流程 3：Vendor

入口命令：

```bash
npm run packs:vendor:pull -- gstack
npm run packs:vendor:sync
npm run packs:vendor:sync -- --check
npm run packs:vendor:status -- gstack
npm run packs:vendor:dirty -- gstack
```

vendor 用来管理 `source=local` 这条支线。它解决的不是“是否启用”，而是“本地副本是否存在、是否脏、是否漂移”。

### 现在支持的 provider

- `git`
- `local-dir`
- `archive`

provider registry 位于 `bin/lib/vendor-providers/`。

### `vendor-sync --check` 的定位

这是给 CI 用的闸门：只检查 drift，不修改文件系统。

## 主流程 4：Report

入口命令：

```bash
npm run packs:report -- list
npm run packs:report -- latest --kind install-codex
npm run packs:report -- summary
npm run packs:report -- summary --json
```

reports 会写到：

```text
.code-abyss/reports/
```

常见 artifact 前缀：

- `install-claude-*`
- `install-codex-*`
- `install-gemini-*`
- `pack-uninstall-<artifactPrefix>-*`

## Uninstall

入口命令：

```bash
npm run packs:uninstall -- gstack --host all --remove-lock --remove-vendor
```

卸载行为以 manifest 为准，读取 `hosts.<host>.uninstall` 后删除：

- runtime root
- 生成出的 command 文件
- 可选 vendor 目录
- 可选 lock 引用

同时会写一份独立 uninstall report。

## 新维护者最容易搞混的点

### manifest 和 lock 不是一回事

- `packs/<name>/manifest.json`：pack 自己能做什么
- `.code-abyss/packs.lock.json`：当前项目要不要启用它

### pack reports 不是日志噪音

reports 是安装结果的结构化证据。以后做 TUI、HTML 或 release 汇总时，都应该优先消费 report，而不是重新去扫 home 目录。

### Codex 有两个根目录

Codex 不只有 `~/.codex/`。外部 pack，尤其是 gstack，可能还会装到 `~/.agents/skills/`。

## 推荐调试顺序

1. 先看 `packs.lock` 是否启用了目标 pack
2. 再看 `manifest` 是否为目标 host 声明了安装信息
3. 再看 report artifact 记录了什么
4. 最后才去看 home 目录里的实际落盘结果

## 相关文档

- [PACK_MANIFEST_SCHEMA.md](./PACK_MANIFEST_SCHEMA.md)
- [PACKS_LOCK_SCHEMA.md](./PACKS_LOCK_SCHEMA.md)
- [ONBOARDING.md](./ONBOARDING.md)
- [../DESIGN.md](../DESIGN.md)