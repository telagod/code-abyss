# Pack Manifest Schema

> 适用对象：新增或维护 `packs/<name>/manifest.json` 的维护者

## 这份文档解决什么问题

当你要新增一个第三方 pack，或者调整某个 pack 在不同 host 下的安装 / 卸载行为时，需要知道 manifest 应该长什么样、哪些字段是强约束、哪些字段只是扩展信息。

## 最小可用示例

```json
{
  "name": "example-pack",
  "description": "What this pack installs.",
  "hosts": {}
}
```

这三个字段缺一不可：

- `name`
- `description`
- `hosts`

## 顶层字段

### 必填字段

| 字段 | 说明 |
| --- | --- |
| `name` | 必须与 `packs/<name>/` 目录名一致 |
| `description` | 非空、给人看的摘要 |
| `hosts` | 每个 host 的安装契约 |

### 可选字段

```json
{
  "reporting": {
    "label": "Example Pack",
    "artifactPrefix": "example-pack"
  },
  "projectDefaults": {
    "claude": "optional",
    "codex": "required",
    "gemini": "optional"
  },
  "upstream": {
    "provider": "git",
    "repo": "https://github.com/org/repo.git",
    "commit": "abc123...",
    "version": "1.2.3"
  }
}
```

#### `reporting`

- `label`：安装 / 卸载输出里展示的人类可读名称
- `artifactPrefix`：report artifact 的文件名前缀

#### `projectDefaults`

定义如果项目没有显式修改 lock，某个 host 默认如何对待这个 pack：

- `required`
- `optional`

#### `upstream`

当 pack 支持 `source=pinned` 或 vendor sync 时，需要声明 upstream。

## `hosts` 块

每个 host block 可以包含：

- `files`
- `uninstall`
- host-specific runtime metadata

示例：

```json
{
  "hosts": {
    "claude": {
      "files": [
        { "src": "config/CLAUDE.md", "dest": "CLAUDE.md", "root": "claude" }
      ],
      "uninstall": {
        "runtimeRoot": { "root": "claude", "path": "skills/example-pack" },
        "commandRoot": { "root": "claude", "path": "commands" },
        "commandExtension": ".md",
        "commandsFromRuntime": true,
        "commandAliases": {
          "primary-command": ["legacy-alias"]
        }
      }
    }
  }
}
```

## `files`

`files` 用于描述“安装时要从仓库复制哪些静态文件”。

每个条目都需要：

- `src`：仓库内源路径
- `dest`：目标根目录下的目标路径
- `root`：`claude | codex | agents | gemini`

## `uninstall`

`uninstall` 用于 `node bin/packs.js uninstall <pack>`。

### 必要字段

- `runtimeRoot.root`
- `runtimeRoot.path`

### 常见可选字段

- `commandRoot`
- `commandExtension`
- `commandsFromRuntime`
- `commandAliases`

### 语义说明

- `runtimeRoot`：要删除的 runtime 根目录
- `commandRoot`：要额外清理的命令目录
- `commandsFromRuntime=true`：命令名可从 runtime 子目录自动推导
- `commandAliases`：额外需要删除的历史命令名

## source mode 与 upstream provider

`packs.lock` 可以把某个 pack 指向：

- `pinned`
- `local`
- `disabled`

如果要支持 `pinned` 或 `local`，manifest 应声明 `upstream`。

### 当前支持的 provider

- `git`
- `local-dir`
- `archive`

额外 provider 可通过以下目录扩展：

- `.code-abyss/vendor-providers/`
- `vendor-providers/`

provider module 需要导出：

- `name`
- `validate(upstream)`
- `sync(ctx)`
- `status(ctx)`

## Reporting 合约

pack 相关操作会向 `.code-abyss/reports/` 写入 JSON artifact。

- 主安装流程会把 pack 结果写进 install report 的 `pack_reports`
- `packs uninstall <pack>` 会写独立 uninstall report
- `reporting.artifactPrefix` 决定后续工具如何归类这些 artifact

## 当前校验规则

现有校验至少会检查：

- 顶层 `name` / `description` / `hosts` 是否存在
- host 名是否属于已知集合
- `files[]` 是否包含 `src` / `dest` / `root`
- `uninstall.runtimeRoot` 是否包含 `root` / `path`
- `reporting.label` / `artifactPrefix` 类型是否合法

## 新增一个 pack 的最短路径

1. 创建 `packs/<name>/manifest.json`
2. 先写最小顶层字段
3. 为需要支持的 host 补 `files` 或 `uninstall`
4. 如果要支持 `pinned` / vendor，同步补 `upstream`
5. 运行：

```bash
npm run packs:check
npm test -- --runInBand test/pack-registry.test.js test/packs-cli.test.js
```

## 常见错误

- `name` 与目录名不一致
- 只写了 `projectDefaults`，却忘了写 `hosts`
- 声明 `source=pinned`，却没有 `upstream`
- 只定义安装，不定义卸载，导致 pack 生命周期不闭环

## 相关文档

- [PACK_SYSTEM.md](./PACK_SYSTEM.md)
- [PACKS_LOCK_SCHEMA.md](./PACKS_LOCK_SCHEMA.md)