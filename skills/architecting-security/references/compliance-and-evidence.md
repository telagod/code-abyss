# 合规与证据链

> 合规不是文档堆砌，是"控制 → 证据 → 持续监控"三层闭环。审计员要的是证据，不是承诺。

## 合规框架对比

| 框架 | 范围 | 类型 | 周期 |
|------|------|------|------|
| **SOC 2** | 服务组织（云、SaaS） | Trust Services Criteria | Type I（点）/ Type II（6-12 月） |
| **PCI DSS 4.0** | 支付卡数据 | 12 requirements | 年度 |
| **HIPAA** | 美国医疗 PHI | Security/Privacy Rule | 持续 |
| **GDPR** | 欧盟个人数据 | 数据主体权利 | 持续 |
| **ISO 27001** | 信息安全管理 (ISMS) | Annex A 控制 | 3 年 + 年监督 |
| **CCPA / CPRA** | 加州个人数据 | 消费者权利 | 持续 |
| **FedRAMP** | 美国联邦云 | NIST 800-53 | High/Moderate/Low |
| **CMMC** | 美国国防供应链 | 5 levels | 3 年 |

## SOC 2 详解

### Trust Services Criteria (TSC)

| ID | 名称 | 范围 |
|----|------|------|
| **CC1** | Control Environment | 治理、组织 |
| **CC2** | Communication | 沟通 |
| **CC3** | Risk Assessment | 风险评估 |
| **CC4** | Monitoring Activities | 监控 |
| **CC5** | Control Activities | 控制活动 |
| **CC6** | Logical and Physical Access | 访问控制 |
| **CC7** | System Operations | 运维 |
| **CC8** | Change Management | 变更管理 |
| **CC9** | Risk Mitigation | 风险缓解 |
| **A1** | Availability（可选） | 可用性 |
| **C1** | Confidentiality（可选） | 机密性 |
| **PI1** | Processing Integrity（可选） | 处理完整性 |
| **P1-P8** | Privacy（可选） | 隐私 |

### Type I vs Type II

- **Type I**: 某一时刻控制设计是否合理（snapshot）— 1 个月准备
- **Type II**: 控制运行有效性（一段时间）— 通常 6-12 月观察期

> 99% 的客户/审计/RFP 要 Type II。Type I 仅作首年过渡。

### 审计期准备清单

```
T-12 月：
  - 选 auditor
  - Gap assessment (内部或外部)
  - 控制设计与文档

T-9 月：
  - 控制部署 + 培训
  - 证据自动化基础建设

T-6 月（Type II 观察期开始）：
  - 持续证据收集
  - 月度 control owner review
  - Vendor management

T-2 月：
  - 内审
  - 修补 gap

T-0：
  - Auditor field work
  - 证据样本提供
  - 报告草稿 review

T+1 月：
  - 报告发布
  - 客户分发（NDA 下）
```

## PCI DSS 4.0

### 12 Requirements

```
1.  网络与系统配置 — 防火墙、网段隔离
2.  默认密码 / 配置 — 改默认、加固
3.  存储中卡数据保护 — Encrypt CHD, never store CVV/PIN
4.  传输中加密 — TLS 1.2+, no SSL/early TLS
5.  Anti-malware
6.  开发与维护安全 — Secure SDLC, vuln management
7.  访问控制（业务需要） — Need-to-know
8.  身份 — Unique IDs, MFA
9.  物理访问
10. 日志与监控
11. 安全测试 — Vuln scan + pentest
12. 信息安全政策
```

### 范围最小化

PCI 范围 = 处理 / 存储 / 传输 CHD 的系统 + 与之相连的系统。

```
CDE (Cardholder Data Environment)
   └─ 直接处理 CHD
   └─ 全部 12 requirements 适用

Connected systems
   └─ 与 CDE 通信但不直接处理 CHD
   └─ 部分要求适用（取决于风险）

Out of scope
   └─ 物理 + 网络 + 数据流 三重隔离
```

> **范围最小化策略**：用 tokenization（CHD → token）让大部分应用脱离范围；只 token vault 在 CDE。

### SAQ vs ROC

- **SAQ** (Self-Assessment Questionnaire): 9 种类型（A/A-EP/B/B-IP/C/C-VT/D-Merchant/D-Service Provider/P2PE）
- **ROC** (Report on Compliance): 由 QSA 出具，Level 1 商户/服务提供商必备

## HIPAA Security Rule

适用美国医疗 PHI（Protected Health Information）。

```
Administrative Safeguards
  ├─ Security Management Process
  ├─ Workforce Training
  └─ Contingency Plan (Disaster Recovery)

Physical Safeguards
  ├─ Facility Access Controls
  ├─ Workstation Security
  └─ Device & Media Controls

Technical Safeguards
  ├─ Access Control (Unique IDs, automatic logoff)
  ├─ Audit Controls
  ├─ Integrity (data not improperly altered)
  ├─ Authentication
  └─ Transmission Security (encryption)
```

### BAA (Business Associate Agreement)

任何处理 PHI 的第三方（云、SaaS、咨询）必须签 BAA。**没 BAA 不能用**——即使技术上完美安全。

主流云 BAA：
- AWS BAA covers: EC2 / S3 / RDS / EBS / DynamoDB / 等（不是所有服务！）
- Azure BAA covers: 大多数核心服务
- GCP BAA covers: 类似

> 用云时务必查最新 HIPAA-eligible services 列表。

## GDPR 关键义务

### 数据主体权利（DSR）

| 权利 | 描述 | SLA |
|------|------|-----|
| Access (Art 15) | 我的数据有什么 | 1 月（可延 2 月） |
| Rectification (Art 16) | 改错 | 1 月 |
| Erasure (Art 17) | 被遗忘权 | 1 月 |
| Restriction (Art 18) | 限制处理 | 1 月 |
| Portability (Art 20) | 数据可移植（机读格式） | 1 月 |
| Object (Art 21) | 反对处理 | 1 月 |
| Automated Decision (Art 22) | 反对 AI 决策 | 即时 |

### DPA (Data Processing Agreement)

数据控制者 (Controller) ↔ 数据处理者 (Processor)：
- 处理目的 + 性质 + 持续时间
- 数据类别 + 主体类别
- 处理者的义务
- 子处理者管控
- 数据传输（特别是欧盟外）

### DPIA (Data Protection Impact Assessment)

何时必做：
- 大规模 PII 处理
- 系统性监控公共空间
- 健康 / 生物数据
- 自动化决策（特别是法律影响）

模板（GDPR Art 35）：
1. 处理活动描述
2. 必要性 + 比例性评估
3. 风险评估（数据主体角度）
4. 缓解措施

### 跨境传输

欧盟 → 第三国数据传输的合法基础：

| 机制 | 描述 | 适用 |
|------|------|------|
| **Adequacy Decision** | 委员会认定该国保护充分 | 英国、日本、加拿大、瑞士、韩国等 |
| **SCCs** (Standard Contractual Clauses) | 标准合同条款 + TIA (Transfer Impact Assessment) | 美国、印度、中国等 |
| **BCRs** (Binding Corporate Rules) | 跨国集团内部规则 | 大企业内部 |
| **Derogations** (Art 49) | 例外（同意 / 合同必要 / 等） | 少量、特殊情况 |

> Schrems II 后美国传输需 TIA，评估美国法律对数据的影响（如 FISA 702）。

## ISO 27001

### ISMS (Information Security Management System)

```
1. 范围定义
2. 安全方针 + 目标
3. 风险评估方法论 + 风险登记
4. SoA (Statement of Applicability)
   └─ Annex A 114 控制项中哪些适用 + 为什么
5. 控制实施
6. 监控 + 审查
7. 持续改进 (PDCA)
```

### Annex A 控制（ISO 27001:2022）

93 个控制，分 4 主题：

| 主题 | 控制数 | 范围 |
|------|--------|------|
| Organizational | 37 | 政策、角色、第三方 |
| People | 8 | 培训、背景调查 |
| Physical | 14 | 设施、设备 |
| Technological | 34 | 加密、访问、运维 |

### 与 SOC 2 关系

ISO 27001 → 治理框架（管理体系）
SOC 2 → 报告（控制有效性）

很多公司同时拿，因为 ISO 客户在欧洲多，SOC 2 客户在美国多。控制 80%+ 重叠。

## 控制 → 证据 → 持续监控 三层模型

### 控制设计

```
风险:    "未授权访问生产数据库"
   ↓
控制:    "DBA 访问需 PAM JIT 申请 + 审批 + 录像"
   ↓
实现:    Teleport + 审批工作流 + 录像存 7 年
   ↓
证据:    审批记录 / 会话录像 / 访问日志
   ↓
监控:    每周 review 异常访问；告警长时 session
```

### 证据类型

| 类型 | 频率 | 例 |
|------|------|----|
| **持续证据** | 实时 / 自动 | 日志保留、配置漂移检测、访问审计 |
| **周期证据** | 月 / 季 / 年 | 访问 review、漏洞扫描、渗透测试报告 |
| **一次性证据** | 仅一次 | 威胁建模、培训完成证书、政策签字 |

### 自动化原则

```
能自动化的不要手动 → 手动的会忘 → 忘的就缺证据 → 审计 fail
```

工具：
- **Vanta / Drata / Secureframe** — 商业 SaaS, 自动接入云控制证据
- **comp.ai / Strike Graph** — 新兴
- 自建：Lambda + S3 evidence bucket + Notion 控制 wiki

## DLP 设计

### 数据分级

```
Public          ← 营销材料、blog
Internal        ← 内部 wiki、组织架构
Confidential    ← 客户列表、财务、源码
Restricted      ← PII / PHI / CHD / 密钥
```

### 控制点

```
Endpoint DLP
   ├─ 复制到 USB
   ├─ 截屏
   ├─ 打印
   └─ 上传到非批准网站

Network DLP
   ├─ 邮件外发监控
   ├─ Web 上传
   └─ 即时通讯

Cloud DLP / DSPM
   ├─ S3 / Drive / OneDrive 扫描
   ├─ 误公开检测
   └─ 跨账号共享

Database Activity Monitoring
   ├─ 大查询告警
   └─ 敏感字段访问审计
```

### 数据流标记

```
Microsoft Purview / Google DLP / AWS Macie

   Input data → 自动分类（PII detection）
              ↓
   Apply label (Restricted)
              ↓
   Label 跟随数据流转
              ↓
   控制依据 label 触发（不允许 label=Restricted 外发）
```

## 隐私工程

### Privacy by Design 7 原则 (Cavoukian)

1. **主动而非被动** — 预防而非补救
2. **默认隐私** — 最严设置默认
3. **嵌入设计** — 不是事后加补丁
4. **正和而非零和** — 隐私 + 功能不冲突
5. **端到端安全** — 数据生命周期全保护
6. **可见 + 透明** — 用户知情
7. **尊重用户隐私** — 用户为中心

### 数据最小化

- 只收**必要**字段（不要"以防万一"）
- 处理后**删除**（保留期最短）
- **聚合替代**个体（用户群分析而非个人画像）

### 假名化 vs 匿名化

| | 假名化 | 匿名化 |
|--|--------|--------|
| 定义 | 用 ID 替换标识符，可逆 | 不可逆，无法重新识别 |
| GDPR | 仍是个人数据 | 不是个人数据（GDPR 不适用） |
| 例 | `user_id=hash(email)` | 仅留聚合统计 |

### k-anonymity

数据集中每条记录至少与 k-1 条记录 indistinguishable on QID (quasi-identifier)。

```
原始: {age=25, zip=10001, disease=cancer}
       {age=27, zip=10003, disease=flu}

3-anonymous (k=3):
       {age=20-30, zip=100xx, disease=cancer}
       {age=20-30, zip=100xx, disease=flu}
       {age=20-30, zip=100xx, disease=heart}
```

### Differential Privacy

数学保证：单个个体加入/移除数据集，统计结果差异 ≤ ε。

```python
# 常用：Laplace 噪声
def dp_count(true_count, epsilon=1.0, sensitivity=1.0):
    noise = np.random.laplace(0, sensitivity / epsilon)
    return true_count + noise
```

适用：发布统计 / 训练 ML 模型（DP-SGD）。

### DSR 自动化

```
1. 用户提交请求 → 工单系统
        ↓
2. 数据发现（Data Catalog / Lineage）
        ↓
3. 跨系统抽取（API / 直连 DB）
        ↓
4. 验证 + 脱敏（其他用户数据不能露）
        ↓
5. 交付（机读格式：JSON/CSV）
        ↓
6. 审计日志（谁请求 / 何时 / 何内容）
```

工具：BigID / OneTrust / Collibra / 自建。

## 审计准备 Checklist

```
治理证据
- [ ] 安全政策（年度 review + 签字）
- [ ] 组织架构 + 角色责任
- [ ] 风险登记（实时维护）
- [ ] 培训完成证据
- [ ] 第三方 BAA / DPA / 评估

技术证据
- [ ] 访问列表（user → role → permission，最近一次 review）
- [ ] 变更管理记录（每个 prod 变更的审批 + 测试）
- [ ] 漏洞扫描报告（季度 + 修复记录）
- [ ] 渗透测试报告（年度 + 修复记录）
- [ ] 备份恢复测试记录
- [ ] IR 演练记录
- [ ] 业务连续性计划测试

运行证据
- [ ] 日志保留（按合规要求 = 1-7 年）
- [ ] 监控告警 + 响应记录
- [ ] 配置基线 + 漂移检测
- [ ] 加密配置 (TLS 版本、KMS 密钥)
- [ ] MFA 启用率 100%（关键账号）
```

## 收口

- 合规不是终点，是持续状态
- "compliant ≠ secure" — 合规是地板，不是天花板
- 每年至少一次内审 + 一次外审（哪怕不强制）
- Auditor 不是敌人——他们能找到你团队找不到的盲区
