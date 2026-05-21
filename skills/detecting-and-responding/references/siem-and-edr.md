# SIEM / EDR / 检测规则编写

> 检测是工程，不是运气。每条规则要回答：what / why / FP rate / response。

## Sigma 规则结构

```yaml
title: Suspicious PowerShell Encoded Command
id: 7e80a8a8-c8e0-4c7a-9b6c-1234567890ab
status: stable
description: |
  Detects PowerShell with -EncodedCommand parameter, commonly used by
  malware to obfuscate payload. Benign use exists (legacy automation),
  so tune by parent process and user.
references:
  - https://attack.mitre.org/techniques/T1059/001/
author: telagod
date: 2026-05-22
modified: 2026-05-22
tags:
  - attack.execution
  - attack.t1059.001
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Image|endswith: '\powershell.exe'
    CommandLine|contains:
      - '-EncodedCommand'
      - '-enc '
      - '-e '
  filter_admin:
    User|startswith: 'NT AUTHORITY\SYSTEM'
    ParentImage|endswith:
      - '\sccm.exe'
      - '\TaniumClient.exe'
  condition: selection and not filter_admin
fields:
  - User
  - ParentImage
  - CommandLine
falsepositives:
  - Legitimate sysadmin scripts (whitelist via filter_admin)
  - Software deployment tools
level: high
```

### 字段意义

- `id`：UUID，全球唯一，用于跨规则集去重
- `status`: `experimental` / `test` / `stable` / `deprecated`
- `level`: `informational` / `low` / `medium` / `high` / `critical`
- `falsepositives`: 必填——审计 review 第一眼看的就是这里

## Sigma 转换

```bash
# 老 sigmac (deprecated) / 新 pySigma
pip install pysigma pysigma-backend-elasticsearch

sigma convert -t lucene -p ecs_windows rule.yml      # → Elastic ECS
sigma convert -t splunk -p sysmon rule.yml           # → Splunk
sigma convert -t kusto -p azure_monitor rule.yml     # → Sentinel KQL
```

**Pipeline 选择**很重要：同一规则在 ECS / Sysmon / Microsoft 365 字段名不同，pipeline 把 Sigma 抽象映射到具体 schema。

## YARA 规则编写

```yara
rule SuspiciousPowerShellPayload {
    meta:
        description = "PowerShell with common obfuscation markers"
        author = "telagod"
        date = "2026-05-22"
        hash = "..."
        severity = "high"

    strings:
        // 字符串模式
        $b64_marker = /\b[A-Za-z0-9+\/]{200,}={0,2}\b/
        $iex = "Invoke-Expression" nocase wide ascii
        $download = "DownloadString" nocase wide ascii
        $hidden = "-WindowStyle Hidden" nocase wide ascii

        // 十六进制（PE 头）
        $mz = { 4D 5A }

    condition:
        // 性能优化：先用 PE 元数据筛
        filesize < 5MB and
        $mz at 0 and
        2 of ($iex, $download, $hidden, $b64_marker)
}
```

### 性能优化

YARA 扫描慢的根源：
1. `pe.imports("kernel32.dll")` 等导入解析慢 → 用 `pe.is_pe` 先过滤
2. 长正则 `.*` → 用具体字符串 + 长度限制
3. `condition: any of them` 在大文件上很差 → 加 `filesize < N` 前置

## EDR 检测原语

| 原语 | 检测什么 | 数据源 |
|------|----------|--------|
| 进程链 | 异常 parent-child（如 `winword.exe → powershell.exe`） | Sysmon Event 1 / EDR process tree |
| Image load | DLL 注入、签名异常 | Sysmon Event 7 |
| Named pipe | 横移 / C2 | Sysmon Event 17/18 |
| DNS query | DGA / 隧道 / 已知坏域 | Sysmon Event 22 / DNS server log |
| Network connection | beaconing / 异常 dest | Sysmon Event 3 / Zeek conn.log |
| File create | 投放 / 持久化 | Sysmon Event 11 / FIM |
| Registry | 持久化（Run / Service） | Sysmon Event 13 |
| Service install | 横移痕迹 | Win Event 7045 / Sysmon Event 6 |

## SIEM 调优三步

### Step 1: 基线化噪声

```sql
-- Splunk 例：列出最吵的告警
| stats count by rule_name
| sort - count
| head 20
```

前 5 条占总噪声 80%+ 是常态。先解决这些。

### Step 2: 噪声分析

每条吵的告警走 **5W 分析**：
- **Who**: 是哪个 user / host / service account 触发？
- **What**: 实际命令 / 行为是什么？
- **When**: 是定时任务还是随机时间？
- **Where**: 来自一个还是多个源？
- **Why**: 业务上为什么会这么干？

> **黄金问题**："如果这个真的是攻击，我会不会丢工作？"——不会的话，规则可禁用或调阈值。

### Step 3: 阈值收紧

| 调整 | 例 |
|-----|----|
| 加 filter | parent process / user / IP 白名单 |
| 时间窗口 | 5min 内 5 次失败登录而非单次 |
| 行为聚合 | 同 user + 多 host 才告警（横移特征） |
| 风险评分 | 单事件低分，多事件累加触发 |

## Detection-as-Code

```
detections/
├── windows/
│   ├── execution/
│   │   ├── powershell_encoded.yml
│   │   └── powershell_encoded.test.yml      ← 单测
│   └── persistence/
└── linux/
```

### 单测格式

```yaml
# powershell_encoded.test.yml
rule: powershell_encoded.yml
positive_cases:
  - name: encoded payload
    log:
      EventID: 1
      Image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
      CommandLine: "powershell.exe -EncodedCommand SQBuAHYAbwBrAGUA..."
      User: "DOMAIN\\alice"
    should_match: true

negative_cases:
  - name: SCCM legitimate use
    log:
      EventID: 1
      Image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
      CommandLine: "powershell.exe -EncodedCommand ..."
      ParentImage: "C:\\Windows\\CCM\\sccm.exe"
      User: "NT AUTHORITY\\SYSTEM"
    should_match: false
```

CI:

```yaml
- name: Sigma test
  run: |
    sigma test detections/ --backend pysigma_backend_elasticsearch
    # 失败 = 规则没覆盖正例 or 误报负例
```

## 高价值检测点

### LOLBins (Living-off-the-Land Binaries)

| 二进制 | 滥用场景 | 检测 |
|--------|----------|------|
| `certutil.exe` | 下载文件、base64 编解码 | `certutil -urlcache -f http*` 或 `-decode` |
| `bitsadmin.exe` | 后台下载 | `bitsadmin /transfer` |
| `wmic.exe` | 远程执行、信息收集 | `wmic /node:` 跨主机 |
| `rundll32.exe` | 加载任意 DLL | 非签名 DLL / 异常 export name |
| `regsvr32.exe` | scriptlet 执行 | `/s /n /u /i:http*` |
| `msiexec.exe` | 安装远程 MSI | `/i http*` |
| `mshta.exe` | HTA 执行 | 任何调用都可疑 |
| `forfiles.exe` | 命令执行 | `forfiles /c` |
| `installutil.exe` (.NET) | 任意 .NET assembly | `/u /logfile=` |

### Suspicious PowerShell

```yaml
detection:
  encoded:
    CommandLine|contains: '-EncodedCommand'
  download_string:
    CommandLine|contains:
      - 'DownloadString'
      - 'DownloadFile'
      - 'Net.WebClient'
  iex_pipe:
    CommandLine|contains:
      - 'IEX'
      - 'Invoke-Expression'
  bypass_policy:
    CommandLine|contains:
      - 'ExecutionPolicy Bypass'
      - 'NoProfile'
      - 'WindowStyle Hidden'
  reflection:
    CommandLine|contains:
      - 'Reflection.Assembly'
      - 'FromBase64String'
  condition: 2 of them
```

### Lateral Movement

| 技术 | 信号 |
|------|------|
| PsExec | Win Event 7045 (service install) + service name `PSEXESVC` |
| WMI exec | Sysmon 1 with `ParentImage=WmiPrvSE.exe` 跨主机 |
| WinRM | Win Event 4262 + EventID 91 (PowerShell remoting) |
| Pass-the-Hash | NTLM auth (Win Event 4624 type 3) without preceding Kerberos |
| Pass-the-Ticket | Suspicious ticket lifetime / encryption type (RC4 in Kerberos AS) |
| RDP hijack | `tscon.exe` / shadow session |

### C2 / Beaconing

```sql
-- Zeek conn.log: 等周期连接同 dest
-- 算法：单 src → dest 的 conn 间隔标准差 / 平均值 < 0.1 = 强 beacon 嫌疑
| stats values(ts) as ts_list count as conn_count by id.orig_h id.resp_h
| where conn_count > 20
| eval intervals = mvmap(ts_list, ts_list[mvfind+1] - ts_list)
| eval interval_stddev = stddev(intervals)
| eval interval_mean = mean(intervals)
| where interval_stddev / interval_mean < 0.1
```

## 误报来源大全

| 来源 | 表现 | 处理 |
|------|------|------|
| 软件部署 | SCCM / Tanium / Intune 调用 PowerShell / WMI | parent process 白名单 |
| 漏洞扫描器 | Nessus / Qualys 触发各种进程行为 | 源 IP 白名单 |
| IT 运维 | 管理员调试 | user account 白名单（但谨慎，IT 账号被盗也常见） |
| 备份脚本 | Veeam / 备份代理大量文件操作 | service account 白名单 |
| 监控代理 | New Relic / Datadog / Zabbix | process / parent 白名单 |
| 自家 SIEM 自身 | Splunk Universal Forwarder 自己抓自己 | host 白名单 |

## 输出物清单

每条规则发布前必备：
- [ ] `id` UUID
- [ ] `falsepositives` 段不为空
- [ ] 至少 1 个 positive 测试 case
- [ ] 至少 1 个 negative 测试 case
- [ ] `references` 包含 ATT&CK 技术 ID
- [ ] `level` 与实际严重度对齐
- [ ] 在 staging SIEM 跑过 7 天，FP rate < 1%
