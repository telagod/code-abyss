# 威胁狩猎 / 紫队演练

> 检测在等告警，狩猎是主动出击。"系统看似正常但你不放心" → 提出假设 → 找证据。

## Hypothesis-Driven Hunting

```
观察 → 假设 → 数据 → 验证 → 规则化 / 排除
```

### 假设来源

| 来源 | 例 |
|------|-----|
| 威胁情报 | "Cobalt Strike beacon 用 ja3 hash a0e9..." |
| 内部事件 | "上次发现 attacker 用 PsExec，看看其他主机有没有" |
| 红队报告 | "渗透报告说用了 Kerberoasting，蓝方能不能发现" |
| 行业 IR 案例 | "SolarWinds 用了恶意更新通道，类似手法在我家有吗" |
| 业务上下文 | "财务月底大额转账，借机进行钓鱼？" |

### 假设格式

> **Bad**: "看看有没有 APT"（无法验证）
>
> **Good**: "如果有 APT，会用 LOLBins 做 C2。过去 30 天，certutil 下载非 Microsoft 域文件的事件 > 0 即可疑。"

可证伪 + 可数据化 = 好假设。

## IOC vs IOA vs TTPs

```
Pyramid of Pain (David Bianco)

       TTPs        ← 最痛（攻击者要重设计行动）
        ↑
     Tools         ← 痛（要换工具）
        ↑
  Network/Host
   Artifacts     ← 中等（改文件名、端口）
        ↑
   Domain Names   ← 容易（注册新域）
        ↑
   IP Addresses  ← 极容易（换 VPS）
        ↑
   Hash Values   ← 最容易（重编译就变）
```

| 指标类型 | 时效 | 防御价值 |
|----------|------|----------|
| **IOC**（哈希、IP、域名） | 短（小时到天） | 战术级、单事件 |
| **IOA**（行为指标） | 中（周到月） | 战术级、可关联多事件 |
| **TTPs**（战术技术程序） | 长（月到年） | 战略级、迫使攻击者重组 |

**狩猎瞄准 TTPs**——一个新的 ATT&CK 技术覆盖，价值远超一千个 IP 黑名单。

## ATT&CK 映射工作流

```
1. 选定范围
   └─ 业务关键资产 / 高风险用户 / 近期事件涉及的攻击阶段

2. 列出相关技术
   └─ ATT&CK Navigator https://mitre-attack.github.io/attack-navigator/
   └─ 按 Tactic 过滤（Initial Access / Execution / Persistence / ...）

3. 评估当前检测覆盖
   ├─ 已有规则 → mapping 到 ATT&CK 技术 ID
   ├─ 数据源缺失 → "no telemetry"
   └─ 有数据但无规则 → "gap"

4. Coverage Score 计算
   每个 (Technique, Sub-technique) 标记：
   - 0: no data
   - 1: data but no detection
   - 2: detection exists but high FP
   - 3: detection exists, low FP, tested

5. 优先填 1 → 2 → 3 的 gap
   先用频度（按 ATT&CK frequency report）+ 影响（红队报告）排序
```

## Hunting 数据源优先级

| 优先级 | 数据源 | 为何 |
|--------|--------|------|
| 1 | EDR 进程链 | 最高保真，可看 parent/child/grandchild |
| 2 | DNS 查询 | beacon / DGA / 数据外泄首要信号 |
| 3 | Proxy / TLS 元数据 | C2 / 数据外泄 |
| 4 | 防火墙 | 网络层异常 |
| 5 | 主机日志 | 持久化、登录 |
| 6 | 应用日志 | 业务异常 |

**反模式**：从最低保真的数据源（如 syslog）开始狩猎 → 噪声爆炸。

## 紫队演练闭环

```
1. 选 ATT&CK 技术（如 T1059.001 PowerShell）
        ↓
2. 红方模拟
   ├─ Atomic Red Team 脚本
   ├─ Caldera adversary profile
   └─ 自家定制 PoC
        ↓
3. 蓝方检测验证
   ├─ 告警触发？是 → ✅
   ├─ 数据有但没触发？→ 写规则
   └─ 数据都没有？→ 加数据源
        ↓
4. 缺口分析
   └─ Detection-as-Code 提交 PR
        ↓
5. 规则编写 + 单测
        ↓
6. 重测（红方 re-execute）
        ↓
7. 文档化 + 加入 coverage matrix
```

### Atomic Red Team 实操

```bash
# 安装
git clone https://github.com/redcanaryco/invoke-atomicredteam.git
Import-Module ./invoke-atomicredteam/Invoke-AtomicRedTeam.psd1

# 列出技术
Invoke-AtomicTest T1059.001 -ShowDetails

# 执行（在测试环境！）
Invoke-AtomicTest T1059.001 -TestNumbers 1

# 清理
Invoke-AtomicTest T1059.001 -TestNumbers 1 -Cleanup
```

每个 atomic test 都有：
- `name`
- `description`
- `executor`（cmd / powershell / sh / manual）
- `dependencies`（要求 admin？要 .NET？）
- `cleanup` 命令

### Caldera

```bash
# 启动 server
cd caldera && python server.py --insecure

# 部署 agent (Sandcat)
curl -X POST -H "X-Caldera-Agent: sandcat" -O server:8888/sandcat.go
```

Caldera 概念：
- **Ability**: 单个 ATT&CK 技术的实现
- **Adversary**: 多个 ability 的链条（模拟整个攻击）
- **Operation**: adversary 在 target 上的实际执行
- **Fact**: operation 收集的环境信息
- **Planner**: 决定下一步 ability 的策略

## Detection Engineering

### Lifecycle

```
[Idea] → [Develop] → [Test] → [Deploy] → [Tune] → [Sunset]
   ↑         ↑          ↑         ↑         ↑         ↑
 hunting   Sigma     unit test  staging  prod FP    rule
 紫队       /YARA     + corpus              monitor  retire
```

### Coverage Scoring 模型

```python
# 加权评分
def detection_score(technique):
    has_data = 1 if data_source_exists(technique) else 0
    has_rule = 1 if rule_exists(technique) else 0
    rule_quality = (
        0.3 * (1 - false_positive_rate) +
        0.4 * true_positive_rate +
        0.3 * detection_speed_score  # alert latency
    )
    coverage = has_data * 0.3 + has_rule * rule_quality * 0.7
    return coverage  # 0.0 - 1.0
```

按 ATT&CK Top 20（基于实际事件频度的优先列表）至少要 ≥ 0.7。

## 蜜罐 / 欺骗防御

| 类型 | 用途 |
|------|------|
| **Canary token** | 假文档、假凭证、假 URL，被访问即告警 |
| **Honey user** | AD 中假用户，登录尝试即检测 Kerberoasting |
| **Honey share** | SMB 共享假文件，访问即检测横移 |
| **Honey credential** | 内存中假密码，被 Mimikatz 抓即检测 |
| **Decoy host** | 整台假主机，被扫描即告警 |

工具：
- **Thinkst Canary** — 商业，最成熟
- **OpenCanary** — 开源
- **Honeyd** — 经典低交互
- **Cowrie** — SSH/Telnet 高交互蜜罐

### 关键纪律

1. **蜜罐内容要可信** — 文件名/路径要诱人但不显眼
2. **告警立即触发** — Canary 命中 = 高可信度，不要走低优队列
3. **不要被检测出是蜜罐** — 文件大小、修改时间、metadata 要正常

## 完整 Hunt 示例：DNS 隧道

### 假设

"过去 7 天若有 DNS 隧道 C2，会表现为：单 client → 单 domain 的 DNS 查询量极高，且子域名熵高。"

### 数据

```sql
-- Zeek dns.log / 企业 DNS server logs
SELECT
  client_ip,
  domain,
  COUNT(*) as query_count,
  COUNT(DISTINCT subdomain) as unique_subdomains,
  AVG(LENGTH(subdomain)) as avg_subdomain_len
FROM dns
WHERE ts > NOW() - INTERVAL '7 days'
  AND query_type IN ('A', 'AAAA', 'TXT')
GROUP BY client_ip, domain
HAVING COUNT(*) > 1000
   AND COUNT(DISTINCT subdomain) > 500
   AND AVG(LENGTH(subdomain)) > 30
ORDER BY query_count DESC
```

### 验证

每条候选记录 → 验证步骤：

1. **是否已知合法**（Spotify, Office 365, Telemetry 等）→ 排除
2. **子域名是否高熵**（Shannon entropy > 4.0）→ 强嫌疑
3. **响应记录是否异常长**（TXT 记录 > 200 字符）→ 数据外泄载体
4. **client 是否有其他可疑活动**（同 host EDR 告警）→ 关联

### 规则化

将分析转为 Sigma 规则：

```yaml
title: DNS Tunneling - High Volume + High Entropy
detection:
  selection:
    query_type:
      - 'A'
      - 'AAAA'
      - 'TXT'
  filter_known:
    domain|endswith:
      - '.akamai.net'
      - '.cloudfront.net'
      - '.azureedge.net'
  condition: selection and not filter_known
  threshold:
    grouped_by:
      - client_ip
      - domain
    window: 1h
    aggregate:
      count: '> 500'
      unique_subdomains: '> 200'
      avg_subdomain_length: '> 30'
```

### 文档化

```markdown
# Hunt-2026-0017: DNS Tunneling Detection

## Hypothesis
DNS tunneling C2 leaves high-volume + high-entropy + long-subdomain signature.

## Data Sources
- Zeek dns.log
- Enterprise DNS server logs

## Method
SQL query + manual triage of candidates

## Findings
- 0 confirmed tunneling
- 3 noisy legitimate sources identified (filtered)
- 1 candidate (client 10.0.5.32 → suspicious-domain.com) — confirmed false positive after deep dive (it's a misconfigured monitoring agent)

## Outputs
- ✅ Detection rule deployed: rule_id=DNS-TUNNEL-001
- ✅ False positive filters added
- ✅ Coverage updated: T1071.004 (DNS) 0.5 → 0.8

## Hunting Cost
8 hours analyst time
```
