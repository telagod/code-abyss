# orchestrating-adversarial-reviews · 工作流详解

> SKILL.md 给骨架与信条，本卷给每条护栏的实操细节 + 完整 worked example。

## 四大护栏（展开）

### 1. 三棱镜对抗验证（防 finder 噪音）

每条发现派**视角各异**的 verifier，而非 N 个同质复读机：

- **可利用性**：给 PoC 或解释为何不可行；前置条件过强 → 降级 / 判误报。
- **正确性**：回源码核实理解；已有防护（参数化 / recover / 校验）使其不成立 → 误报。
- **证伪猎杀**：主动推翻；是否设计预期 / 语境内不构成问题。默认怀疑。
- 裁决：`confirmed` 票数达多数（如 3 镜取 2）才保留。用 `schema` 强制 verifier 给 verdict，validation 在 tool-call 层重试，不靠解析。

### 2. 证明性测试 guard / load-bearing（防 implementer 谎报）

> 这是本 skill 的命门。实战中施工 agent 声称"SSRF 全覆盖、唯一出口收口"，是对抗验证 + 证明测试揪出它漏了一条 executor 旁路。

- 修复必须配一个**真行为**测试（真拨号 / 真请求 / 真启动），断言漏洞被堵。
- **验证测试本身扛得住**：临时把代码退回漏洞版，测试必须 FAIL；还原后 PASS。要求 agent 报告这个"反向证伪"的实测结果，否则视为未证明。
- 字符串判定函数的单测 != 证明测试；要驱动真实代码路径。

### 3. build-first + 退出码 guard（防误删 / 半成品上线）

- 破坏性切换（蓝绿 / 替换）**先构建并验证新件，绿了才动旧件**；新件失败则旧件原地不动。
- 守卫链里**绝不让管道遮住退出码**：`cmd | tail` 的 `$?` 是 `tail` 的，不是 `cmd` 的 —— 曾因此 `&&` 误判成功而删掉旧容器导致全停。判码用 `cmd > log 2>&1; rc=$?` 或裸 `cmd && next`，别用 `cmd | tail && next`。
- 数据 / 卷级删除前确认无引用、有备份、可回滚。

### 4. 语境校准降噪

fan-out 前给所有 agent 钉死威胁模型 / 评判语境，否则收一堆无效发现：

- 例：单租户 + admin 即最高权限 → "admin 能配置 X"不算提权，别报。
- 例：dev 开放模式是显式 opt-in → 只评"生产信号下"的失败方向。

## Worked example：安全审计加固闭环（首个范例）

```
1. Recon   六维并行 finder(authz/crypto/ssrf/parsing/deployment/api),
           各深读对应子系统, schema 出结构化 findings。"找什么"引用 securing-systems。
2. Verify  每条 x 三棱镜(可利用/正确/证伪), 取多数 confirmed -> 合成定级报告 + NO-GO。
3. Fix     单 implementer 改全部(跨文件一致) + 每刀配 load-bearing 证明测试。
4. Re-verify 多棱镜对抗(逐刀 solid/weak/broken + 回归), 揪出"声称修好实则旁路"。
5. Patch   补漏 + 证明测试反向证伪坐实。
6. Ship    commit -> build-first 蓝绿热替换 -> 线上三态验证(none/guest/admin)。
```

变更闭环的提案 / 分阶段 / 自审理念见 `shipping-changes`；本 skill 在其上加"多-agent fan-out + 对抗验证 + 证明 guard"层。

## Workflow 工具映射速查

| 阶段 | Workflow 原语 | 要点 |
|------|--------------|------|
| Recon fan-out | `pipeline(dims, find, verify)` | 默认无栅栏，墙钟 = 最慢单链 |
| 需跨条去重 / 早退 | `parallel(...)` 栅栏 | 仅当下一步需全部上步结果 |
| verifier 裁决 | `agent(..., {schema})` | 强制 verdict，tool-call 层重试 |
| 并行写同批文件 | `isolation: 'worktree'` | 防工作区冲突 |
| 舰队规模 | `budget` / ultracode | 按 opt-in 与 token 预算缩放 |

## 升级路径

L0 本地私有（显式调用，不入路由）→ 稳定后经 `cultivating-skills` 的 `skill_forge.js promote --to project` 升 L1（入 git、强 lint）→ 社区 PR 升 L2（全 block + 全 warn 清零）。
