# Packs Lock Schema

> 适用对象：维护 `.code-abyss/packs.lock.json` 的仓库维护者

## 这份文档解决什么问题

如果 manifest 说的是“pack 能怎么装”，那 `packs.lock` 说的就是“这个项目现在决定装什么”。这份文档只管项目级声明，不讨论 pack 自身结构。

## 推荐最小示例

```json
{
  "version": 1,
  "hosts": {
    "claude": {
      "required": ["gstack"],
      "optional": [],
      "optional_policy": "auto",
      "sources": {
        "gstack": "pinned"
      }
    },
    "codex": {
      "required": ["gstack"],
      "optional": [],
      "optional_policy": "auto",
      "sources": {
        "gstack": "pinned"
      }
    },
    "gemini": {
      "required": ["gstack"],
      "optional": [],
      "optional_policy": "auto",
      "sources": {
        "gstack": "pinned"
      }
    }
  }
}
```

## 顶层字段

### `version`

当前固定值：

- `1`

### `hosts`

已知 host：

- `claude`
- `codex`
- `gemini`

每个 host block 可以包含：

- `required`
- `optional`
- `optional_policy`
- `sources`

## 字段语义

### `required`

这些 pack 一定会安装。适合放团队必须依赖的 workflow runtime。

### `optional`

这些 pack 是否安装，取决于 `optional_policy`。

### `optional_policy`

支持值：

- `auto`
- `prompt`
- `off`

语义如下：

- `auto`：自动安装 optional packs
- `prompt`：交互式安装时询问；`-y` 时回落到自动安装
- `off`：跳过 optional packs

### `sources`

给每个 pack 指定安装来源：

- `pinned`
- `local`
- `disabled`

## source mode 的约束

### `pinned`

使用 pack manifest 里声明的 pinned upstream source。

### `local`

优先使用：

- `.code-abyss/vendor/<pack>`
- 或 host-specific env override

### `disabled`

保留声明，但跳过安装。常用于临时屏蔽某个 optional pack。

## 校验规则

`node bin/packs.js check` 会至少检查：

- `version` 是否合法
- host 是否属于已知集合
- pack 是否存在于 registry
- `optional_policy` 是否合法
- `sources.<pack>` 的 mode 是否合法
- 同一 pack 是否同时出现在 `required` 和 `optional`
- `required` pack 是否错误地使用了 `source=disabled`

## 推荐工作流

### 初始化 / 刷新

```bash
npm run packs:bootstrap
npm run packs:bootstrap -- --apply-docs
```

### 修改策略

```bash
npm run packs:update -- --host codex --add-optional gstack --optional-policy prompt --set-source gstack=local
```

### 校验与比较

```bash
npm run packs:check
npm run packs:diff
```

### 本地源同步

```bash
npm run packs:vendor:pull -- gstack
npm run packs:vendor:sync
npm run packs:vendor:sync -- --check
```

## 新维护者最容易犯的错

### 把 `abyss` 写进 `packs.lock`

不要这样做。`abyss` 是 core bundled pack，不应通过 `packs.lock` 重复声明。

### 误以为 lock 会覆盖 manifest

不会。lock 只能选择 pack 是否启用、从哪里装，不能替代 manifest 里的安装细节。

### 忘了给新 host 补齐 policy

如果 pack 需要在 `gemini` 也启用，就要显式为 `gemini` 配置 host block，而不是只改 `claude` / `codex`。

## 什么时候改 lock，什么时候改 manifest

- 改“这个 pack 支持怎么安装”：改 manifest
- 改“这个项目是否启用它”：改 lock
- 两者都变：先改 manifest，再改 lock

## 相关文档

- [PACK_SYSTEM.md](./PACK_SYSTEM.md)
- [PACK_MANIFEST_SCHEMA.md](./PACK_MANIFEST_SCHEMA.md)