# 事件响应 / 数字取证

> NIST 800-61 是骨架，5 个 W 是肉。一次好的 IR 收尾，下次少踩 80% 坑。

## NIST 800-61 阶段

```
准备 (Preparation)
  ├─ runbook 备齐
  ├─ 工具就位（imaging / memory / log）
  ├─ 通讯路径定义
  └─ 联系人清单更新
      ↓
检测分析 (Detection & Analysis)
  ├─ 告警分诊
  ├─ 范围评估
  ├─ 数据收集
  └─ 时间线构建
      ↓
遏制根除 (Containment & Eradication)
  ├─ 短期遏制（隔离）
  ├─ 长期遏制（修复 + 监控）
  ├─ 根因分析
  └─ 清除（rebuild not clean）
      ↓
恢复 (Recovery)
  ├─ 业务功能验证
  ├─ 加固复测
  └─ 监控强化
      ↓
复盘 (Lessons Learned)
  ├─ Blameless postmortem
  ├─ 改进项跟踪
  └─ 规则 / runbook 更新
```

## Triage 优先级矩阵

|  | 高影响 | 中影响 | 低影响 |
|--|--------|--------|--------|
| **高紧迫** | P1（数据外泄、勒索、生产瘫痪） | P2 | P3 |
| **中紧迫** | P2 | P3 | P4 |
| **低紧迫** | P3 | P4 | P4 |

- **P1**：15 分钟响应，全员动员，CISO + Legal + PR
- **P2**：1 小时响应，IR 队
- **P3**：4 小时响应，工程师 + IR 双人
- **P4**：次日工单

## Chain of Custody

证据要在法庭站得住：

```
[发现] → [固化] → [保管] → [分析] → [归档]
   ↓        ↓        ↓        ↓        ↓
 时间戳   哈希值   签字记录  操作日志  存储位置
```

### 关键纪律

1. **Write-blocker 必用** — 物理或软件，磁盘镜像时禁原盘写
2. **`dd` + `sha256sum` 双备份** — 镜像后立即算 hash，所有后续操作的产物链回到此 hash
3. **每次操作记录** — `who / when / what / why / artifact_hash_before / artifact_hash_after`
4. **原件不动** — 所有分析在副本上

```bash
# Linux: 磁盘镜像
sudo dd if=/dev/sda of=/mnt/evidence/sda.dd bs=4M status=progress conv=noerror,sync
sha256sum /mnt/evidence/sda.dd > /mnt/evidence/sda.dd.sha256

# 备份的备份（异地）
rsync -av --checksum /mnt/evidence/ backup-host:/evidence-archive/
```

## Volatile Data Collection 顺序

按 RFC 3227 易失性排序，从最易丢的先收：

```
1. CPU 寄存器 / 缓存          ← 几乎无法采集（停机即丢）
2. 内存                       ← AVML (Linux) / WinPmem (Windows)
3. 网络连接表 + 路由           ← ss / netstat / ip / arp
4. 进程列表                   ← ps / Process Explorer
5. 文件描述符 / 打开句柄        ← lsof / handle
6. 临时文件                   ← /tmp / Windows Temp
7. 磁盘                       ← dd / FTK Imager
8. 远程日志                   ← syslog / SIEM
9. 物理设备                   ← 硬盘归档
```

### Memory Acquisition

```bash
# Linux — AVML（Microsoft 开源）
sudo ./avml /mnt/evidence/host01-memory.lime

# Windows — WinPmem
winpmem.exe -o E:\evidence\host01.aff4

# 分析（Volatility 3）
vol -f host01-memory.lime windows.pslist          # 进程列表
vol -f host01-memory.lime windows.netscan         # 网络连接
vol -f host01-memory.lime windows.malfind         # 注入代码区域
vol -f host01-memory.lime windows.cmdline         # 进程命令行
vol -f host01-memory.lime linux.bash              # bash 历史（Linux）
```

## 取证关键工件

### Windows

| 工件 | 路径 | 用途 |
|------|------|------|
| Event Log | `C:\Windows\System32\winevt\Logs\` | 登录、服务、PS、Sysmon |
| Prefetch | `C:\Windows\Prefetch\*.pf` | 进程执行历史（最近 128 程序） |
| Amcache | `C:\Windows\AppCompat\Programs\Amcache.hve` | 执行过的程序 + hash |
| ShimCache | 注册表 `SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache` | 程序兼容性记录 |
| SRUM | `C:\Windows\System32\sru\SRUDB.dat` | 应用使用、网络数据 |
| USN Journal | `\$Extend\$UsnJrnl:$J` | 文件操作日志 |
| MFT | `\$MFT` | 文件元数据（含已删除） |
| Registry | NTUSER.DAT / SYSTEM / SOFTWARE / SECURITY / SAM | 系统配置、用户活动 |
| Recent | `%AppData%\Microsoft\Windows\Recent` | 最近打开文件 |
| Jump Lists | `%AppData%\Microsoft\Windows\Recent\AutomaticDestinations` | 应用历史 |

工具：KAPE（采集）、Eric Zimmerman tools（分析）、PECmd / AmcacheParser / SrumECmd。

### Linux

| 工件 | 路径 | 用途 |
|------|------|------|
| Auth log | `/var/log/auth.log` / `secure` | 登录 / sudo |
| Syslog | `/var/log/syslog` / `messages` | 系统事件 |
| Bash history | `~/.bash_history` / `~/.zsh_history` | 命令历史（不可信，可篡改） |
| Audit | `/var/log/audit/audit.log` | auditd 详细系统调用 |
| Cron | `/var/spool/cron/` / `/etc/cron.*` | 定时任务持久化 |
| Systemd | `/etc/systemd/system/` / `~/.config/systemd/user/` | 服务持久化 |
| .bashrc | `~/.bashrc` / `/etc/profile.d/` | shell 启动持久化 |
| SSH keys | `~/.ssh/authorized_keys` | 后门 |
| Package mgr | `/var/log/apt/history.log` / `dpkg.log` / `yum.log` | 软件安装 |
| Last log | `wtmp` / `btmp` / `lastlog` | 登录历史 |

工具：plaso (log2timeline)、Velociraptor 收集器、Linux-Forensics 工具集。

### macOS

| 工件 | 路径 | 用途 |
|------|------|------|
| Unified Log | `/var/db/diagnostics/` | 系统统一日志 |
| FSEvents | `/.fseventsd/` | 文件系统事件 |
| Quarantine DB | `~/Library/Preferences/com.apple.LaunchServices.QuarantineEventsV2` | 互联网来源文件标记 |
| LaunchAgents | `~/Library/LaunchAgents/` | 用户级持久化 |
| LaunchDaemons | `/Library/LaunchDaemons/` | 系统级持久化 |

工具：`log show --predicate ...`、mac_apt、Sumuri RECON。

## Cloud IR

不同于本地 IR，云有**特殊优势 + 特殊盲点**：

### 优势

- 完整 control plane 日志（CloudTrail / GCP Audit / Azure Activity Log）
- 网络流（VPC Flow Logs / NSG Flow Logs）
- 快照即取证镜像（EBS snapshot / Disk snapshot）
- API 隔离便捷（IAM detach 即遏制）

### 盲点

- 数据平面日志默认关（S3 access log、object-level CloudTrail）
- 跨区/跨账号日志延迟（CloudTrail 跨区 ~15min）
- 短期资源（Lambda）取证窗口短
- Container 暂态（Fargate / Cloud Run 退出即灰飞烟灭）

### AWS IR Playbook 模板

```
1. 隔离
   - IAM user: aws iam attach-user-policy --policy-arn arn:aws:iam::aws:policy/AWSDenyAll
   - EC2: aws ec2 modify-instance-attribute --instance-id i-... --groups sg-isolated
   - 不要 stop instance（丢失 ephemeral data）

2. 证据采集
   - 内存：SSM Run Command → AVML → S3
   - 磁盘：aws ec2 create-snapshot
   - CloudTrail 时间线：aws athena query

3. 分析
   - CloudTrail：jq + Athena
   - VPC Flow Logs：Athena partition by hour
   - GuardDuty findings 关联

4. 遏制
   - IAM role 撤销
   - Access Key rotation
   - Security Hub 检查同账号其他异常

5. 恢复 + 加固
   - 受影响资源 rebuild（不要 clean）
   - 加 SCP / IAM 收紧
   - GuardDuty / Detective 持续监控
```

## IR 通信模板

### Status Update（每 30min 一次 P1）

```
[IR-2026-0042] Status Update #3 — 2026-05-22 14:30 UTC

Status: CONTAINMENT
Severity: P1
Started: 13:15 UTC

What's happening:
- Suspected data exfiltration from prod-db-01
- ~5GB outbound to 198.51.100.42 between 12:45-13:10 UTC
- Attacker access via leaked AWS access key (rotated 13:20)

What we've done:
- ✅ Isolated prod-db-01
- ✅ Rotated all access keys
- ✅ Snapshot taken for forensics
- 🔄 Reviewing CloudTrail for lateral access

Next 30 min:
- Confirm scope of exfiltrated data
- Check if other systems compromised
- Prepare customer notification (if PII)

Need:
- Legal team: confirm notification timeline
- DBA: identify which tables in scope
```

### Stakeholder 通讯链

```
P1: Tech Lead → Eng Manager → VP Eng → CTO → CEO → Legal → PR
    + IR commander 全程协调
P2: Tech Lead → Eng Manager → 必要时升级
P3+: 工单 + Slack channel
```

## Post-Incident: Blameless Postmortem

模板：

```markdown
# Incident IR-2026-0042 Postmortem

## Summary
- One paragraph, what happened.

## Timeline
- 12:45 UTC — Attack started (in retrospect)
- 13:15 UTC — Alert fired
- ...

## Impact
- Customer: ...
- Data: ...
- Service: ...

## Root Cause
- The 5 whys.

## What Went Well
- Detection latency < 30min
- ...

## What Went Poorly
- Access key was in code 2 weeks before rotation
- ...

## Action Items
| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | Enable AWS Secrets rotation | @alice | 2026-06-01 | open |
| 2 | Add IAM access key age detection | @bob | 2026-06-15 | open |
```

**关键纪律**：**对事不对人**。不写"Alice forgot to rotate"，写"Rotation process lacked automation enforcement"。

## 收口

- IR runbook 必须定期演练（quarterly tabletop, annually live drill）
- 每次 P1/P2 必有 postmortem
- Action items 必跟到关闭，否则下次同样事故必复发
