# 提交人格到社区

> 不重造提交流程。本 skill 只生成 payload，引导跳转 [submit portal](https://telagod.github.io/code-abyss/submit.html)。

## 三步提交

### 1. 本地校验通过

```bash
node scripts/persona_forge.js validate config/personas/<slug>.json
```

block 必须清零，warn 必须清零（社区门槛比本地高）。

### 2. 生成 submission payload

```bash
node scripts/persona_forge.js publish config/personas/<slug>.json
```

输出：
- `submission/<slug>.json`（可直接粘贴到表单 / Issue——整个人格就这一个文件，不再有 identity.md 需要一并提交）
- `submission/checklist.md`（提交前自检）

### 3. 跳转 submit portal

打开 [https://telagod.github.io/code-abyss/submit.html](https://telagod.github.io/code-abyss/submit.html)：

1. 选择"分步指南"或"完整示例"模式
2. 把 `<slug>.json` 字段填入表单（slug / label / description / self / user / language / register / emoji_policy / flourish）
3. 表单自动生成 Issue 模板 → 点"Open Issue Template on GitHub"

或直接走 Issue：

```
https://github.com/telagod/code-abyss/issues/new
?template=persona-submission.yml
&title=[Persona] <Label>
```

## 提交前自检（checklist.md 模板）

```markdown
- [ ] persona-voice-card schema 通过（validate 已跑，block=0）
- [ ] self / user 自然且独特，与内置人格无冲突
- [ ] description 一句话清晰，不含营销腔
- [ ] 不含真实人名 / 商标 / 政治宗教内容
- [ ] author 字段填了真实可联络的 GitHub handle
- [ ] LICENSE 同意以 MIT 贡献
```

## 维护者 review 流程

1. **triage**：bot 自动跑 schema 校验 + 内容安全扫描
2. **diff review**：维护者看 voice 差异度——现在是个 ~400 字节的 diff，能整段读完
3. **合并**：通过则 merge 到 `config/personas/<slug>.json`，下一个 minor 版本发布

## 撤回 / 升级

| 场景 | 路径 |
|------|------|
| 修 typo / 调表述 | 直接 PR |
| 改 voice（self/user/register/emoji_policy/flourish） | 提 Issue 讨论后 PR |
| 撤回（行为不当 / 法律风险） | 维护者 hot-fix，CHANGELOG 记录 |

## 反模式

- ❌ 在 PR 直接附 `<slug>.json` 但跳过 portal → 走表单更顺，校验更早
- ❌ 一次提交多个人格 → 拆 PR，单 persona 单 PR
- ❌ 不填 author → 维护者无法联络，必拒
- ❌ 复制内置人格只改名字 → 差异度校验必拒
