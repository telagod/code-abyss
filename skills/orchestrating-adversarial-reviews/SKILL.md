---
name: orchestrating-adversarial-reviews
description: Multi-agent adversarial-verification orchestration for high-confidence conclusions. Fan-out finders, then verify every finding through a three-prism panel (exploitability / correctness / refutation) that defaults to disbelief, gate fixes behind load-bearing proof tests that catch agents who falsely claim "done/fixed", and roll out behind a build-first exit-code guard. Use when a fan-out task must produce trustworthy results — security audit, code review, research synthesis, migration — and a single agent's self-report cannot be trusted. Composes with securing-systems (what to look for) and shipping-changes (change closed loop); orchestration engine is the Workflow tool.
user-invocable: false
allowed-tools: Read
---

<!-- safety-scan: ignore RM_RF_ROOT,CURL_PIPE_SH,PROMPT_INJECTION 本 skill 把危险命令(| tail 吞退出码、docker rm 误删、agent 谎报)列为反模式教学，自身不执行 -->
<!-- safety-scan: ignore TOOLS_PRIVILEGED 知识型 skill，仅 Read；文中 Workflow / docker / go / git 命令由 agent 自有工具执行，非本 skill 落盘运行 -->

# 对抗验证编排 · orchestrating-adversarial-reviews

> 单个 agent 会谎报"已修复 / 全覆盖 / 没问题"。结论的可信度不来自"谁说的"，来自"扛过几次推翻"。
> 本 skill 是**编排骨架**：fan-out 发现 → 三棱镜对抗验证 → 证明性 guard → 守卫式上线。
> 信级：运行时行为 / 证明测试 > 多 agent 多数裁决 > 单 agent 自报（永远 `[unverified]`）。

## 核心信条

1. **不信单 agent 自报。** finder 会噪音误报，implementer 会谎称"已修复/全覆盖"。每个高价值结论必须被独立 agent 用**不同视角**尝试推翻。
2. **可证伪 > 可声称。** 修复必须配一个"退回漏洞代码就 FAIL、修好才 PASS"的 **load-bearing 证明测试**。没有证明测试的"已修复"等于没修。
3. **失败方向要对。** 守卫链里任何一步的退出码都不能被管道遮住；破坏性动作前置可逆检查。

## 何时使用

| 场景 | 用 | 理由 |
|------|----|------|
| 授权安全审计 / 加固闭环 | ✅ | 首个范例，见 [workflow](references/workflow.md) |
| 大面积代码审查（多维度、需高可信） | ✅ | dimensions → find → 对抗验证 |
| 研究综合 / 事实核查（结论要扛得住） | ✅ | 多源 fan-out + 证伪棱镜 |
| 大规模迁移 / 重构（site 发现 + 逐项验证） | ✅ | pipeline 逐项独立 + 证明测试 |

## 何时不使用

- ❌ 单文件、低风险、机械改动——直接做完跑测试，别套编排（参见 `shipping-changes` 的"何时不使用"）。
- ❌ 用户没有 opt-in 多-agent 编排 / 没开 ultracode——Workflow 会 fan-out 几十个 agent 烧大量 token，必须显式授权。
- ❌ 只需要"找什么洞"的知识——那是 `securing-systems` / `analyzing-security`，本 skill 不重写知识，只编排。

## 编排骨架（三相）

```
Recon (fan-out)     每维一个 finder, 并行深读, schema 出结构化 findings
   |                pipeline 而非 barrier: 维度A的发现可在维度B还在找时就进验证
   v
Verify (三棱镜)     每条 finding 派 N 个 verifier, 各执一镜, 默认怀疑
   |                可利用性 / 正确性 / 证伪猎杀 —— 票数 >= 多数 才保留
   v
Synthesize / Ship   合成定级报告; 若是修复任务 -> 证明测试 guard -> build-first 上线
```

对应 Workflow 工具的 `pipeline(items, findStage, verifyStage)`（默认无栅栏，墙钟最短）。仅当"下一阶段需全部上一阶段结果"（去重 / 早退 / 跨条比较）才用 `parallel` 栅栏。

## 四大护栏（实战血泪，按重要度）

1. **三棱镜对抗验证**（防 finder 噪音）——每条发现派视角各异的 verifier（可利用性 / 正确性 / 证伪猎杀），默认怀疑，多数票 `confirmed` 才保留。
2. **证明性测试 guard / load-bearing**（防 implementer 谎报）——修复配真行为测试，且测试本身能"反向证伪"（退回漏洞版必 FAIL）。**本 skill 的命门。**
3. **build-first + 退出码 guard**（防误删 / 半成品上线）——先构建验证新件再动旧件；`cmd | tail` 会吞掉 `cmd` 的退出码，判码用 `cmd > log 2>&1; rc=$?`。
4. **语境校准降噪**——fan-out 前钉死威胁模型 / 评判语境，否则收一堆无效发现。

> 每条护栏的细节、PoC 判据、反向证伪实操、安全审计 worked example，见 [references/workflow.md](references/workflow.md)。

## 反模式

- 信单 agent "已修复 / 没问题 / 全覆盖"——必过对抗验证 + 证明测试。
- `up --build 2>&1 | tail && rm <old>`——管道吞码，build 失败仍删旧件。
- N 个同质 verifier 复读同一判断——要视角多样，否则冗余不抗错。
- 多 agent 同一工作区并行**写**同批文件——冲突；要么单 implementer，要么 `isolation: worktree`。
- 用户未 opt-in 时擅自 fan-out 大舰队——先确认或估算成本。

## 参见

- `securing-systems` —— 攻防知识总路由（找什么洞）。
- `shipping-changes` —— 单上下文变更闭环脊柱。
- `cultivating-skills` —— 本 skill 的孵化器 / 安全脊柱 / 升级漏斗。
- Workflow 工具 —— 编排引擎（pipeline / parallel / schema / budget）。
