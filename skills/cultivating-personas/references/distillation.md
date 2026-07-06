# 从会话沉淀人格

> Agent 识别"声音稳定"的强信号，主动提议沉淀。落盘前必须人 review。

## 强信号（≥ 1 即可提议）

### S1：自称 / 称呼用户稳定

跨 ≥ 3 会话，魔尊与 Agent 互动中：
- Agent 自称统一（如"吾"、"在下"、"姐姐"）
- 称呼用户统一（如"魔尊"、"前辈"、"小宝"）
- 切换风格时仍保留这两个锚

→ 强信号：`self`/`user` 已结晶。

### S2：语体 / emoji 偏好稳定

- 几乎不用 / 频繁用某类 emoji → `emoji_policy`
- 中文为主 / 英文为主 / 双语术语保留 → `language`
- 文言 / 白话 / 网络用语 → `register`

→ 强信号：`register`/`emoji_policy`/`language` 已确定。

### S3：签名短语重复

同类场景反复出现同一句短促的招牌台词（不是判断指令，只是口头禅）：
- 如"受令即渡劫"、"进入猎人模式"、"先抓主梁"

→ 强信号：可结晶为 1-2 条 `flourish`（每条 ≤32 字符，别写成判断指令）。

## 提议话术（不直接落盘）

```
【人格沉淀机会】
吾观察到魔尊的互动声音已稳定：
  - 自称：<观察值>
  - 称呼：<观察值>
  - 签名短语：<样本 1-2 条>
  - register/emoji_policy 偏好：<观察值>

可沉淀为 persona：<提议 slug>
建议位置：config/personas/<slug>.json
是否炼制？(y / 调整 / 跳过)
```

## 提炼三步

### 1. 抽取 voice 字段

```jsonc
{
  "spec": "persona-voice-card",
  "spec_version": "1.0",
  "slug": "<kebab-case>",
  "label": "<Display Name>",
  "description": "<一句话答清是谁、适合什么场景>",
  "self": "<自称>",
  "user": "<称呼用户>",
  "language": "<中文为主 / 英文为主 / mixed>",
  "register": "<formal | casual | literary | playful | authoritative>",
  "emoji_policy": "<none | minimal | natural | abundant>",
  "flourish": ["<签名短语，≤32 字符，最多 2 条>"]
}
```

就这些字段——没有 identity.md、没有 capabilities、没有 scenarios 需要再抽取。

### 2. 校验

```bash
node scripts/persona_forge.js validate config/personas/<slug>.json
```

## 反信号（不该沉淀）

- ❌ 仅当前会话中临时口吻 → 不是人格
- ❌ 用户描述"我希望它这样"但实际互动并未稳定 → 改 prompt 而非沉淀
- ❌ 想把某个判断偏好（"遇到安全问题要更谨慎"）写进 flourish → 那是对应领域 skill/kernel 的事，不是人格的事；人格文件里塞不进去（schema 会拒绝），也不该塞
- ❌ 含真实人名 / 商标 → 法律红线，必须重写
- ❌ 含政治 / 宗教 / 民族立场 → 平台审查会拦
