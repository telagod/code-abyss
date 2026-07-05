---
name: detecting-and-responding
description: 蓝队与紫队工程：检测规则编写、SIEM/EDR 调优、事件响应、数字取证、威胁狩猎、ATT&CK 映射、紫队演练闭环。Use when writing Sigma/YARA detection rules, tuning SIEM noise, responding to security incidents, conducting forensic analysis, hunting threats, or running purple team exercises.
user-invocable: false
---

# 蓝队检测与响应 · 镇魔盾

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/security/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> 检测是工程，不是运气。每条规则必须能回答四问：**what / why / FP rate / response**。
> 站在防御侧，把告警当代码维护、把事件当事故管理、把狩猎当假设验证。
> 信级：项目日志/EDR 原始事件 > Sigma/YARA 规则库 > ATT&CK 官方矩阵 > 训练记忆（标 `[unverified]`）。

## 路由

| 意图 | 秘典 | 触发词 |
|------|------|--------|
| SIEM/EDR 规则与调优 | [siem-and-edr](references/siem-and-edr.md) | Sigma, YARA, Splunk, Elastic, Sentinel, EDR, LOLBins, detection-as-code |
| 事件响应与取证 | [incident-response](references/incident-response.md) | IR, NIST 800-61, triage, chain of custody, Volatility, memory, runbook, postmortem |
| 威胁狩猎与紫队 | [threat-hunting](references/threat-hunting.md) | hunt, hypothesis, IOC, IOA, TTP, ATT&CK, Atomic Red Team, Caldera, 蜜罐 |

## 执行链

```
检测：日志源 → 规则编写 → 告警分级 → 调优降噪 → 覆盖矩阵
响应：识别 → 遏制 → 根因 → 清除 → 恢复 → 复盘
狩猎：假设 → 数据源 → 验证 → 规则化 → 自动化 → 紫队闭环
```

每环必须可回答「我看的是哪条日志？我证伪的是哪条假设？我下一步动作是什么？」

## 何时使用

| 场景 | 用 | 不用 |
|------|----|----|
| 写 Sigma/YARA 规则、调 SIEM | ✅ siem-and-edr | — |
| 处理已发生入侵、取证 | ✅ incident-response | — |
| 假设驱动狩猎 / 紫队演练 | ✅ threat-hunting | — |
| ATT&CK 检测覆盖打分 | ✅ threat-hunting | — |
| 设计应用层防御代码 | ❌ | [defending-applications](../defending-applications/SKILL.md) |
| 渗透测试、写 PoC | ❌ | [securing-systems](../securing-systems/SKILL.md) (pentest/red-team) |
| 威胁建模、IAM 架构 | ❌ | [architecting-security](../architecting-security/SKILL.md) |
| 代码静态扫描胶水 | ❌ | [analyzing-security](../analyzing-security/SKILL.md) |
| 云配置基线、K8s 加固 | ❌ | [securing-cloud-and-supply-chain](../securing-cloud-and-supply-chain/SKILL.md) |

## 联动

- **securing-systems/red-team**：攻方 TTP 是本 skill 检测规则的设计输入。
- **securing-systems/threat-intel**：IOC/CTI 投喂本 skill 的规则与狩猎假设。
- **architecting-security/threat-modeling**：威胁模型的 detective control 在本 skill 落地。
- **analyzing-security**：本 skill 产出的 detection-as-code 接入 CI 门禁。
- **automating-devops/observability**：日志/指标/链路三支柱的安全维。

## 铁律

1. **无噪不出闸** — 任何规则上线前必须有基线 + FP rate 测量；FP > 5% 直接打回调优，不准带病上线。
2. **不证伪即假设** — 狩猎必须有可证伪的假设；找不到不是结论，是数据缺失或假设错。
3. **取证不破坏现场** — 先采易失证据（内存/网络/进程），再动磁盘；写阻断器 + 哈希链 + 时间戳三件套必须齐。
4. **检测即代码** — 规则进 git、有 unit test、过 CI、有 owner；改规则等同改生产代码。
5. **闭环到 ATT&CK** — 每条规则、每次事件、每次狩猎必须映射到 ATT&CK 技术 ID；无 ID 不归档。

## 输出约束

- 规则示例必须给完整 frontmatter + detection + condition + 反例说明（为什么不这样写）。
- 命令示例标注操作系统与权限要求（root / SYSTEM / 普通用户）。
- 日志样例脱敏：IP 用 `192.0.2.0/24`、域名用 `example.com`、用户名用 `<analyst>`。
- 每条检测规则必须附 FP 来源清单与响应动作（containment / enrichment / kill）。
