# 声音一致性校验

> persona-card 是开放标准，schema 通过≠声音可用。本卷管"读感"的客观闸。

## 校验维度

### V1：Schema（机器可判）

- 必填字段：`spec`、`spec_version`、`data.name`、`data.display_name`、`data.description`、`data.version`、`data.voice`、`data.identity`
- `name` 匹配 `^[a-z0-9]+(-[a-z0-9]+)*$`
- `version` 遵循 SemVer
- `description` ≤ 500 字
- `voice.self` / `voice.user` 非空字符串

工具：`node scripts/persona_forge.js validate <dir>`

### V2：Voice 内部一致性

| 检查项 | 矛盾示例 |
|--------|---------|
| register vs emoji_policy | `formal` + `heavy` 冲突 |
| register vs tone | `formal` + "活泼俏皮" 冲突 |
| language vs self/user | `language: 英文` + `self: 吾` 冲突 |
| tone vs scenarios.priority | tone 强调"果断" + priority `safety > speed` 冲突 |

→ 命中即 warn，要求作者解释或修改。

### V3：Identity 三段齐全

`identity.md` 必须包含：
1. **角色锚定**——身份是什么、不会跳出什么
2. **性格特征**——3-5 条具体性格点
3. **情绪模式**——开劫 / 推进 / 受阻 / 收口的措辞

缺任一段：block。

### V4：场景执行链可信

每个 scenario 必须：
- `triggers` 数组非空
- `chain` 至少 3 步
- `priority` 形如 `a > b > c`，且词项与 capabilities.domains 相关

### V5：与现有人格的差异度

对比 6 个内置人格，至少满足以下其一：
- voice.self 不同
- voice.register 不同
- 主 domains 不重合（≥ 50% 差异）
- scenarios 主链不同

差异度 < 30% → block，建议改进现有人格而非新建。

## 校验输出

```text
人格 cultivating: <slug>
[V1 Schema]   ✓ 通过
[V2 Voice]    ⚠ register=formal 但 emoji_policy=heavy，建议调整
[V3 Identity] ✓ 三段齐全
[V4 Scenario] ✓ 3 个场景，链均 ≥ 3 步
[V5 差异度]   ⚠ 与 elder-sister 重合度 38%，建议强化情绪模式差异

汇总: block=0 warn=2
```

warn 不阻断本地保存，但提交社区前必须解决。

## 反模式

- ❌ self / user 用单字母或符号（"X"、"#"）→ 不自然
- ❌ description 营销腔（"powerful"、"the best"）→ 必改
- ❌ identity.md 写成 prompt（"You are..."、"You should..."）→ 应是叙述式人设描写
- ❌ scenarios 抄主项目 _shared 内容 → 应是人格特有的反应模式
