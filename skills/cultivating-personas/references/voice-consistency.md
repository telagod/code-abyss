# 声音差异度校验

> persona-voice-card 是开放标准，schema 通过≠与现有人格有区分度。本卷管"差异度"的客观闸。
> 没有 identity/scenarios 需要判断了——机器能判的就是全部，本卷比 v1 短得多。

## 校验维度

### V1：Schema（机器可判，结构性）

- 必填字段：`spec`、`spec_version`、`slug`、`label`、`self`、`user`、`language`、`register`、`emoji_policy`
- `additionalProperties: false`——任何未知字段（比如想塞 `authorization`、`scenarios`）直接拒绝
- `self`/`user` ≤16 字符、`language` ≤60 字符，均不含换行/`>`/`|`/`#`/`→`
- `register`/`emoji_policy` 必须是各自的枚举值
- `flourish` 最多 2 项，每项 ≤32 字符，且 `self+user+Σflourish` 总长 ≤60

工具：`node scripts/persona_forge.js validate config/personas/<slug>.json`

### V2：与内置人格的差异度

对比 6 个内置人格：

| 检查项 | 结果 |
|--------|------|
| self 与 user 都完全相同 | block——真撞车，改一个或直接 fork |
| register + emoji_policy + language 三者都相同 | warn——建议至少改一项，否则读起来和现有人格无区分 |

没有 domains/scenarios 可比了——差异度现在只看这几个字段，判断也就直白得多。

### V3：内容自然度

- `self`/`user` 是单个非中文符号（如 "X"、"#"）→ warn，可能读起来不自然
- `description` 带营销腔（"powerful"、"the best"）→ warn

## 校验输出

```text
校验: config/personas/<slug>.json
[BLOCK] VOICE_COLLISION: self/user 与内置人格 elder-sister 完全相同
[WARN]  DESC_MARKETING_TONE: description 带营销腔

汇总: block=1 warn=1
```

warn 不阻断本地保存，但提交社区前必须解决（`persona_forge.js publish` 要求 warn 也清零）。

## 反模式

- ❌ self / user 用单字母或符号（"X"、"#"）→ 不自然
- ❌ description 营销腔（"powerful"、"the best"）→ 必改
- ❌ 复制内置人格只改 slug/label → 差异度校验必拒
