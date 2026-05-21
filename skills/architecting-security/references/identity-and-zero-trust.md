# 身份与零信任架构

> "Never trust, always verify, least privilege per request." 三句话，决定整个 IAM 设计。

## 零信任三原则

```
1. Never trust          → 网络位置不代表信任级别
2. Always verify         → 每次请求都重新认证 + 授权
3. Least privilege per request → 不给"所有时刻"的权限
```

### 核心转变

```
传统:  perimeter → 信任内网 → VPN 进来即可信
零信任: identity → 每请求验 → 即使内网也不可信
```

## IAM 设计层次

```
┌──────────────────────────────────────────────┐
│  L1 Identity      用户 / 服务 / 设备           │
│  L2 Authentication  我是谁 + 我能证明           │
│  L3 Authorization   我能做什么                 │
│  L4 Audit           我做了什么                 │
└──────────────────────────────────────────────┘
```

每层独立设计，不要混淆：
- **认证**问"你是谁"，**授权**问"你能做什么"
- 多 MFA 不代表多权限——MFA 是认证强度，不是授权扩展

## SSO 协议对比

| 协议 | 数据格式 | 适用 | 不适用 |
|------|---------|-----|--------|
| **SAML 2.0** | XML | 企业内 SaaS、AD 集成 | 移动 App、API |
| **OAuth 2.0** | JSON | 委托授权（"代表用户"） | 纯认证（这是 OIDC 的活） |
| **OIDC** | JSON / JWT | 现代 Web/Mobile/SPA | 纯系统对系统（用 mTLS） |
| **WS-Federation** | XML | 老 Microsoft 栈 | 新项目避免 |
| **CAS** | XML/JSON | 教育领域历史悠久 | 一般场景用 OIDC 替代 |

> **决策**：新项目首选 OIDC + OAuth 2.0；遇到老 SaaS 用 SAML；mTLS 适合机器到机器。

详细 OAuth/OIDC 实现在 [defending-applications/oauth-and-sessions.md](../../defending-applications/references/oauth-and-sessions.md)。

## MFA 强度排序

```
弱  ────────────────────────────────────────────────  强
SMS < 邮件 < TOTP < Push通知 < Smart Card < FIDO2/WebAuthn
```

| 因子 | 优势 | 弱点 |
|------|------|------|
| SMS | 部署简单 | SIM swap、SS7、社工 |
| Email | 简单 | 邮箱被攻陷即破 |
| TOTP (Google Auth) | 离线、无二次基础设施 | 钓鱼仍可（实时输入） |
| Push (Duo / Authenticator) | UX 好 | MFA Fatigue 攻击（轰炸用户点同意） |
| Smart Card | 物理 | 不便携 |
| **FIDO2 / WebAuthn** | 抗钓鱼 + 设备绑定 | 用户需要兼容设备 |

### MFA Fatigue 防御

```
风险信号：单用户 5min 内 >5 次 push → 暂停 push，要求 step-up auth (FIDO2 / 重新输密码)
```

## WebAuthn 实操

```javascript
// 注册（用户首次绑定 passkey）
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: server_random_bytes,
    rp: { id: "example.com", name: "Example Corp" },
    user: { id: user_id, name: "alice@example.com", displayName: "Alice" },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],  // ES256
    authenticatorSelection: {
      authenticatorAttachment: "platform",  // 或 "cross-platform"
      residentKey: "required",              // resident key = 服务端不需要存 user_id
      userVerification: "required"          // 强制本地验证（PIN/Biometric）
    },
    attestation: "direct"                    // 拿到 attestation 验证 authenticator 真伪
  }
});

// 服务端验证 attestation 证书链 + 存 credential.id + public_key
```

```javascript
// 登录
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: server_random_bytes,
    rpId: "example.com",
    userVerification: "required"
  }
});
// 服务端验证签名 + counter（防重放）
```

### 关键纪律

- `userVerification: "required"` → 强制 PIN/Biometric，不是只 presence
- `attestation: "direct"` → 验 authenticator 厂商（金融场景 must）
- `rpId` 必须等于 origin 的 eTLD+1，否则跨子域绕过
- counter 不递增 = 凭证被克隆，立即撤销

## Kerberos 攻击面（AD 环境）

| 攻击 | 描述 | 检测 |
|------|------|------|
| **Kerberoasting** | 请求 SPN 服务 ticket → 暴破密码 | TGS-REQ 异常请求量 + RC4 加密 |
| **AS-REP Roasting** | 不需要预认证的账号 → 离线破密码 | DONT_REQUIRE_PREAUTH 标志的账号清单 |
| **Pass-the-Hash** | NTLM 哈希直接认证 | NTLM 在内部网络的使用（应该 0） |
| **Pass-the-Ticket** | 偷 TGT → 假冒用户 | 异常 ticket lifetime / IP |
| **Silver Ticket** | 用 service account 哈希伪造 ST | service account 哈希泄漏 |
| **Gold Ticket** | 用 krbtgt 哈希伪造任意 TGT | krbtgt 双重轮换 (180 天) |
| **DCSync** | 伪装 DC 拉取所有密码哈希 | "Replicating Directory Changes" 权限滥用 |
| **Skeleton Key** | DC 内存植入主密码 | LSASS 异常 |
| **Diamond/Sapphire Ticket** | 改造 PAC | PAC validation enforcement |

### AD 加固清单

- [ ] **LAPS** (Local Administrator Password Solution) — 本地管理员密码自动轮换
- [ ] **Tiered Admin Model**:
  - Tier 0: DC、PKI、ADFS（最敏感）
  - Tier 1: Server / 应用
  - Tier 2: Workstation
  - 跨层登录禁止（管理员账号 vs 工作站永不在同一会话）
- [ ] **Protected Users group** — 拒绝 NTLM、强制 AES、ticket 4h
- [ ] **Authentication Silos** — 限制管理账号只能从特定主机登
- [ ] **Disable NTLM** — 全网 Kerberos only
- [ ] **krbtgt 双轮换** — 每 180 天，相隔 24h+
- [ ] **禁用 SPN-less service accounts** — 服务账号必须有 SPN，启用 AES

## PAM (Privileged Access Management)

```
传统 PAM:           Standing privilege（持续特权）
                    └─ 总是能 sudo / DBA 角色
                    └─ 风险：账号被盗即灾难

现代 PAM (JIT):     Just-in-Time + Just-Enough
                    └─ 默认无特权
                    └─ 申请 → 审批 → 临时授予 (15-60min)
                    └─ Session 录像
                    └─ 自动撤销
```

### JIT PAM 工作流

```
1. 工程师需要 prod DB write
        ↓
2. 在 PAM 控制台申请 ("修复 ticket TICK-1234")
        ↓
3. PAM 路由到审批人（manager 或同 oncall）
        ↓
4. 审批通过 → PAM 注入临时角色 (60min TTL)
        ↓
5. Session 全程录像 + keystroke 审计
        ↓
6. 60min 到 → 自动撤销
        ↓
7. 审计日志存 7 年（合规）
```

### 工具选型

| 工具 | 类型 | 适用 |
|------|------|------|
| **CyberArk** | 商业 | 大企业、合规重 |
| **HashiCorp Boundary** | 自建 / 云 | 中等规模、tech-savvy |
| **Teleport** | 开源 + 商业 | K8s / SSH / DB / Web 统一访问 |
| **AWS IAM Identity Center** (formerly SSO) | 云原生 | AWS 多账号 |
| **Azure PIM** | 云原生 | Azure / Entra ID |
| **StrongDM** | 商业 | 数据库专家 |

### Break-Glass 账号

紧急情况（PAM 系统宕机、生产事故）需要的"破玻璃"账号：

- 物理保管（保险柜、密封信封）
- 双人双密（split secret）
- 任何使用都立即告警（包括 SOC + Legal）
- 每 90 天演练 + 轮换

## Conditional Access (Entra ID 风格)

策略 = `(用户/组) + (云应用) + (条件) → (授予/拒绝/MFA/Session 控制)`

```yaml
# 例：高风险登录强制 MFA + 设备合规
policy:
  name: "Block risky sign-in from unmanaged devices"
  assignments:
    users: All
    cloud_apps: All
    conditions:
      sign_in_risk: [medium, high]
      device_filter: "device.isCompliant -ne true"
  controls:
    grant: block
```

```yaml
policy:
  name: "Step-up auth for admin actions"
  assignments:
    users: GlobalAdministrators
    cloud_apps: AzureManagement
  controls:
    grant: require_mfa, require_compliant_device
    session: sign_in_frequency=4h
```

### 设计纪律

- **deny-by-default**: 写 deny 策略，再写允许的例外
- **冲突处理**: 多策略命中时 deny 优先
- **Persona policies**: admin / 普通用户 / 服务账号 分别策略
- **emergency access exclusion**: break-glass 账号必须在所有 deny 策略的排除列表

## 服务账号 / Workload Identity

```
反模式:           长 token 在 .env / Vault / CI Secret
                  └─ 泄漏即长期失陷

现代:            Workload Identity
                 └─ 短期 token (15-60min)
                 └─ 自动轮换
                 └─ 与 workload 身份绑定（K8s SA / VM IAM Role / OIDC）
```

### SPIFFE / SPIRE

跨平台 workload 身份框架：
- **SPIFFE ID**: `spiffe://example.com/ns/prod/sa/payments`
- **SVID** (SPIFFE Verifiable Identity Document): X.509 cert 或 JWT
- **SPIRE Server + Agent**: 自动签发 SVID 给已认证 workload

适用：多云、多 K8s 集群、Istio mTLS。

### K8s Workload Identity 模式

```yaml
# AWS IRSA (IAM Roles for Service Accounts)
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/PaymentsRole
  name: payments

---
# Pod 用此 SA → 获取临时 AWS 凭证（无需 secret）
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: payments
  containers:
  - name: app
    # 运行时通过 OIDC token 换 AWS STS credentials
```

类似机制：GCP Workload Identity / Azure Workload Identity / GKE Workload Identity Federation。

## 离职流程（Deprovisioning）

最大的 IAM 漏洞之一：员工走了账号还在。

### SLA

| 角色 | 最迟 deprovisioning 时间 |
|------|------------------------|
| 普通员工 | 24 小时 |
| 接触 PII / 财务 | 4 小时 |
| 系统管理员 / DBA | 1 小时 |
| 已知有意离职（不友好） | 走人前已禁 |

### 必扫资产清单

- [ ] AD / LDAP 账号禁用 + 移出所有组
- [ ] 邮件 + 自动转发到 manager
- [ ] SSO 应用列表清算（每个独立平台）
- [ ] VPN / Bastion 凭证撤销
- [ ] SSH 公钥（Git / 服务器 authorized_keys）
- [ ] API token / Personal Access Token 撤销
- [ ] 云控制台账号
- [ ] Slack / Teams / Confluence
- [ ] 设备 wipe + return
- [ ] PAM JIT 账号清理
- [ ] 物理徽章 / 门禁

### Orphan Account 清理

定期（季度）扫描：
- 90 天未登录账号 → 禁用
- 180 天未登录 → 删除
- 已离职但未 deprovision → 立即处理 + 调查

## 改造路线图：从 perimeter → 零信任

```
Phase 0: 现状评估
   └─ 现有 IAM 体系 + 网络架构 + 应用清单

Phase 1: 身份 (3-6 月)
   ├─ SSO 全面部署
   ├─ MFA 全员（先 admin，再扩面）
   ├─ AD 加固（LAPS, Tiered Admin）
   └─ 离职流程自动化

Phase 2: 设备 (6-12 月)
   ├─ MDM (Intune / Jamf) 全员
   ├─ Device compliance (encryption, OS patch)
   └─ Conditional Access 接入设备风险

Phase 3: 应用 (12-18 月)
   ├─ ZTNA (BeyondCorp / Cloudflare Access / Tailscale) 替代 VPN
   ├─ Per-app authz（不是网络层授权）
   └─ Session-level controls (DLP / 数据脱敏)

Phase 4: 数据 (18-24 月)
   ├─ 数据分级 + 标签
   ├─ DLP / Cloud Access Security Broker
   └─ Just-in-Time 数据访问

Phase 5: 持续优化
   ├─ Risk-based authentication 全面
   ├─ Behavioral analytics (UEBA)
   └─ 自动化响应
```
