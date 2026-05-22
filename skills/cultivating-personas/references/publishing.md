# 提交人格到社区

> 不重造提交流程。本 skill 只生成 payload，引导跳转 [submit portal](https://telagod.github.io/code-abyss/submit.html)。

## 三步提交

### 1. 本地校验通过

```bash
node scripts/persona_forge.js validate <persona-dir>
```

block 必须清零，warn 必须清零（社区门槛比本地高）。

### 2. 生成 submission payload

```bash
node scripts/persona_forge.js publish <persona-dir>
```

输出：
- `submission/persona-card.json`（可直接粘贴到表单 / Issue）
- `submission/identity.md`（同上）
- `submission/checklist.md`（提交前自检）

### 3. 跳转 submit portal

打开 [https://telagod.github.io/code-abyss/submit.html](https://telagod.github.io/code-abyss/submit.html)：

1. 选择"分步指南"或"完整示例"模式
2. 把 `persona-card.json` 字段填入表单（slug / display name / description / voice / domains / tags）
3. 把 `identity.md` 内容粘贴到"Identity Content"
4. 表单自动生成 Issue 模板 → 点"Open Issue Template on GitHub"

或直接走 Issue：

```
https://github.com/telagod/code-abyss/issues/new
?template=persona-submission.yml
&title=[Persona] <Display Name>
```

## 提交前自检（checklist.md 模板）

```markdown
- [ ] persona-card.json schema 通过
- [ ] voice.self / voice.user 自然且独特
- [ ] description 一句话清晰，不含营销腔
- [ ] identity.md 含角色锚定 + 性格特征 + 情绪模式
- [ ] 与 6 个内置人格差异度 ≥ 30%
- [ ] 不含真实人名 / 商标 / 政治宗教内容
- [ ] 已自我测试 ≥ 3 个场景
- [ ] author 字段填了真实可联络的 GitHub handle
- [ ] LICENSE 同意以 MIT 贡献
```

## 维护者 review 流程

1. **triage**：bot 自动跑 schema 校验 + 安全扫描
2. **diff review**：维护者看 voice / identity 差异度
3. **互动测试**：在内部 sandbox 跑 3 个 scenarios，看输出
4. **合并**：通过则 merge 到 `config/personas/<slug>/`，下一个 minor 版本发布

## 撤回 / 升级

| 场景 | 路径 |
|------|------|
| 修 typo / 调表述 | 直接 PR |
| 改 voice / scenarios | 提 Issue 讨论后 PR |
| 撤回（行为不当 / 法律风险） | 维护者 hot-fix，CHANGELOG 记录 |

## 反模式

- ❌ 在 PR 直接附 `persona-card.json` 但跳过 portal → 走表单更顺，校验更早
- ❌ 一次提交多个人格 → 拆 PR，单 persona 单 PR
- ❌ 不填 author → 维护者无法联络，必拒
- ❌ 复制内置人格只改名字 → 差异度校验必拒
