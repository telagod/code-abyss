---
name: shipping-changes
user-invocable: false
description: End-to-end change-shipping closed loop for non-trivial work — research → proposal doc → phased guarded implementation → PR self-review → harden → merge. Use when taking a substantial change from idea to merged PR, when a task needs a written proposal before code, when implementing in reversible phases behind a guarded commit chain (assert + test + verify, all green before commit), or when self-reviewing your own PR. Complements automating-devops (which is the git/CI/release knowledge reference); this skill is the orchestration spine that sequences a change from zero to merged.
allowed-tools: Read
---

<!-- safety-scan: ignore TOOLS_PRIVILEGED 知识型 skill，仅 Read；文中 git/gh/npm 命令由 agent 自有工具执行，非本 skill 落盘运行 -->

# 渡劫之链 · shipping-changes

> 大改动不是一锤子。调研定题 → 提案对齐 → 分阶段守卫式推进 → PR 自审 → 补护栏 → 合并。每一关绿了才进下一关。

## 何时使用

| 场景 | 使用 | 理由 |
|------|------|------|
| 一个改动牵动多文件 / 多模块 / 公共路径 | ✅ | 回归面大，值得先提案再施工 |
| 重构、架构调整、协议/格式变更 | ✅ | 需要写实蓝图 + 字段映射对齐 |
| 改动可拆成可独立 revert 的阶段 | ✅ | 守卫链分阶段，控爆炸半径 |
| 自审自己的 PR | ✅ | 用挑刺视角找自己埋的雷 |

## 何时不使用

- ❌ 单文件、低风险、机械改动——直接改完跑测试即可，别套流程
- ❌ 纯探索 / 一次性查询——无交付物，不进闭环
- ❌ 紧急止血(宕机/事故)——走故障链「止血→定位→修复→验证→复盘」，不在此列

## 七关闭环

```
关 0  调研定题   —— 摸清现状 + 业界最佳实践，定问题域(不臆造)
关 1  提案文档   —— docs/<topic>.md：诊断 + 蓝图 + 字段映射 + 迁移路径 + 风险回滚
关 2  对齐       —— 魔尊 review 提案；歧义/破坏性/高成本处停下确认
关 3  分阶段实现 —— 每阶段单一关注点、可独立 revert；单点 PoC 绿了再横推
关 4  守卫链提交 —— assert + test + verify 全绿才 commit；任一红即阻断，不提交
关 5  PR 自审    —— 挑刺视角过 diff，把发现挂到 PR 上(含已知取舍)
关 6  补护栏     —— 把自审揪出的隐患钉成测试，follow-up 推上分支
收口  合并       —— 确认 mergeable + CI 全绿 → merge → 同步本地 main
```

## 核心铁律:守卫链提交(关 4)

> 这是全链最值钱的一环——**绝不提交未验证的改动**。

```bash
# 守卫式链:前一步红，后续全部不执行(&& 短路),自然阻断提交
node /tmp/assert.js \            # 自定义不变量断言(如:零宏泄漏、无跨配串味)
  && npm test \                  # 全量测试
  && npm run verify:skills \     # 项目专属闸门
  && git add -A && git commit -F msg.txt \
  && git push -u origin <branch>
```

- **任一关红 → 链断 → 不 commit**：脏改动永不入库。
- **自定义 assert 优先于通用测试**：通用测试覆盖不到的领域不变量,自己写脚本断言(例:渲染产物零模板变量泄漏)。
- **stamp 在链尾**:push / PR 放最后,网络受阻不影响已验证的本地 commit。

> ⚠ **反模式(血泪)**:别把 test 与 commit 塞进同一个 `{ ...; ... }` / `;` 顺序块——块内命令各自独立执行,**test 红了 commit 照样跑**,守卫退化成「记录」而非「阻断」。必须用 `&&` 串成短路链,让前一关的非零退出码真正掐断后续。改了源,先想哪条旧断言要同步改,否则 test 必红。

## 分阶段实现(关 3)

| 原则 | 说明 |
|------|------|
| 单一关注点 | 一阶段只做一类改动(接线 / 数据迁移 / 新增层 / 测试),便于 revert |
| 向后兼容优先 | 新路径在旧产物缺省时退化为旧行为(byte-compat),降低回归风险 |
| 单点 PoC + 低风险先行 | 先拿代表性目标开刀,纯增量/行为等价的阶段先做;绿了再横推、再推中高风险阶段 |

## 影响面检查(关 4.5)

如果 `abyss` 可用（`command -v abyss`），提交前对每个修改过的函数跑影响面分析：

```bash
abyss impact <changed-function> --json
```

- risk > 7：在 PR description 中标注「高影响变更」+ 列出影响面
- uncovered paths > 0：在 PR description 中标注「需补测试」+ 列出未覆盖路径
- 耦合文件未同步修改：提醒检查 `abyss map` 中的 coupling 对

## PR 自审(关 5)

挑刺视角,按等级分类挂到 PR:

- 🟡 **应在本 PR 或紧随处理**:缺护栏的回归风险、新行为无专属测试
- 🟢 **设计取舍(记录在案)**:与理想方案的有意偏差、宿主限制
- ⚪ **可选打磨**:美观瑕疵、风格统一

> 自审要诚实标注「已知不一致仍在」「为兼容做的妥协」,而非粉饰。误报要核实后澄清(例:扫描器把角色名当人称漏网)。

## 收口

- 每关都要落到:**结论 + 动作 + 验证 + 风险 + 下一步**。
- 合并前确认:`mergeable=CLEAN` + CI 全绿;合并后同步本地 main,删远端分支。
- 闭环留尾:未做的阶段(如更深的重构)记入提案文档的「余劫」,标为独立后续。

参见 [automating-devops](../automating-devops/SKILL.md)——git/CI/release 的知识底座;本 skill 只管「怎么把一个改动从零推到合并」的编排。
