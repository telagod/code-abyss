# 威胁建模

> 威胁建模不是"想想哪里会出问题"——是结构化方法。STRIDE 分类、DFD 边界、攻击树细化。

## 何时威胁建模

| 场景 | 必做 |
|------|-----|
| 新系统设计阶段 | ✅ |
| 重大架构变更（新数据流、新信任域） | ✅ |
| 上线前安全评审门 | ✅ |
| 监管/合规要求（PCI / HIPAA / SOC2） | ✅ |
| 老系统首次评审 | ✅ |
| 仅 UI 改造 / 文档变化 | ❌ |
| 已建模、变更范围在边界内 | ⚠（增量评审） |

## STRIDE — 6 类威胁

| 字母 | 威胁 | 安全属性 | 例 |
|------|------|----------|-----|
| **S** | Spoofing | 认证 | 假冒用户、伪造 token |
| **T** | Tampering | 完整性 | 修改请求、篡改 DB |
| **R** | Repudiation | 不可否认 | 否认操作、无审计 |
| **I** | Information Disclosure | 机密性 | 数据泄露、错误信息 |
| **D** | Denial of Service | 可用性 | 资源耗尽、过载 |
| **E** | Elevation of Privilege | 授权 | 越权、特权升级 |

### STRIDE 应用模式

每个 DFD 元素类型有不同 STRIDE 关注点：

| DFD 元素 | S | T | R | I | D | E |
|----------|---|---|---|---|---|---|
| External Entity | ✅ | — | ✅ | — | — | — |
| Process | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Data Flow | — | ✅ | — | ✅ | ✅ | — |
| Data Store | — | ✅ | ✅ | ✅ | ✅ | — |

> **Process 是六全威胁面**——所有 STRIDE 类别都适用。

## DFD（数据流图）绘制

### 四元素

```
[ 外部实体 ]              ((  进程  ))             ║ 数据存储 ║

   方块                   圆 / 双圆                  双线
  e.g. User                e.g. Web App           e.g. Database

数据流：→ 箭头标注「内容」（如 "user_credentials"）

信任边界：- - - - 虚线，标注「跨边界类型」（如 "Internet → DMZ"）
```

### 绘制纪律

1. **从外部入口起** — 用户、第三方 API、上游系统
2. **画到数据存储止** — DB、对象存储、缓存、密钥库
3. **每条 data flow 标内容** — "credentials" / "session_token" / "PII"
4. **每条信任边界要回答**："这条边界两侧的信任级别差异是什么？"

### 示例：OAuth 登录流程 DFD

```
                    ╔═══════════════════════╗
                    ║   Internet (untrust)  ║
                    ╚═══════════════════════╝
                              │
   [User Browser] ─auth_code─→ ((Auth Service))
                              │       │
                              │       ▼
                              │   ((IdP))
                              │       │
                  ─id_token───┘       │
                              │       │
                    ╔═════════│═══════╪═══╗
                    ║         ▼       ▼   ║
                    ║   ((App API))      ║
                    ║         │           ║
                    ║         ▼           ║
                    ║   ║ DB ║            ║
                    ║                     ║
                    ║   Internal (trust)  ║
                    ╚═════════════════════╝
```

### STRIDE 分析（示例 OAuth）

| 元素 | S | T | R | I | D | E |
|------|---|---|---|---|---|---|
| User Browser | 假冒用户 | XSS 改请求 | — | localStorage 泄露 | — | — |
| Auth Service (Process) | 假冒 | 改 redirect_uri | 无审计 | 错误信息泄敏 | 暴力枚举 | scope 升权 |
| IdP (External) | IdP 假冒 | — | IdP 否认签发 | — | — | — |
| `id_token` Data Flow | — | JWT 篡改 | — | 中间人 | — | — |
| ║ DB ║ | — | SQL 注入 | DBA 否认改动 | 数据外泄 | 大查询 OOM | 提权 |

每格 → 缓解措施 → 验证用例。

## PASTA — 7 阶段（业务驱动）

```
1. 定义业务目标
   └─ "保护客户支付信息，符合 PCI DSS"

2. 定义技术范围
   └─ Web App / API / 支付网关 / 后台 DB

3. 应用分解
   └─ DFD + 数据分类

4. 威胁分析
   └─ 接入威胁情报、CTI、行业事件库

5. 漏洞 / 弱点分析
   └─ STRIDE / OWASP / CVE 扫描结果

6. 攻击建模
   └─ 攻击树 / Kill Chain / ATT&CK 映射

7. 风险与影响分析
   └─ 似然 × 影响 → 接受 / 缓解 / 转移 / 规避
```

PASTA 比 STRIDE 更**业务对齐**，适合大企业、合规驱动场景。STRIDE 适合工程师快速建模。

## LINDDUN — 隐私威胁

| 字母 | 威胁 | 隐私属性 |
|------|------|----------|
| **L** | Linkability | 不可关联 |
| **I** | Identifiability | 匿名 |
| **N** | Non-repudiation | 可否认（隐私场景反向需求） |
| **D** | Detectability | 不可观察 |
| **D** | Disclosure | 机密性 |
| **U** | Unawareness | 透明 / 知情同意 |
| **N** | Non-compliance | 合规 |

### 何时用

GDPR / 隐私敏感系统（健康、金融、儿童数据）必做。

```
LINDDUN 应用：
1. 画 DFD（同 STRIDE）
2. 标注每个数据元素的隐私分类（PII / sensitive PII / pseudonymized / anonymized）
3. 对每个 PII 元素跑 LINDDUN 7 类
4. 隐私缓解模式：
   - L → 数据分割、不同 ID 不互通
   - I → 假名化、Differential Privacy
   - U → 显式 consent UI、数据保留通知
   - N → DPA / Audit / Data Lineage
```

## 攻击树

```
Goal: 拿到 prod DB 数据
├─ OR: 直接连 DB
│   ├─ AND: 拿到 DB 凭证 + 网络可达
│   │   ├─ 钓鱼 DBA
│   │   ├─ 偷代码仓库（硬编码）
│   │   └─ 偷 CI/CD Secret
│   └─ AND: VPN 接入 + 凭证
├─ OR: SQL 注入
│   ├─ Web 应用注入
│   └─ 内部工具注入
├─ OR: 通过备份
│   ├─ 偷 S3 backup
│   └─ 备份服务凭证
└─ OR: 通过 DBA 主机
    ├─ 钓鱼 → 端点失陷
    └─ 物理接近
```

每个叶节点估算 **代价**（攻击者投入）+ **概率**：

```
[钓鱼 DBA]
  cost: 1 (低)
  probability: 0.4
  detection: 0.3 (中等检测可能)
  → risk score: 0.4 × 0.7 = 0.28
```

按风险分排序 → 优先缓解 top N。

## 输出物

每次威胁建模产出：

```markdown
# Threat Model: {System Name}

## Scope
- In: {组件清单}
- Out: {显式排除}

## Architecture
{DFD 图 + trust boundary 描述}

## Data Classification
| 数据 | 分级 | 存储 | 传输 |
|------|------|------|------|
| ... | ... | ... | ... |

## Threats
| ID | STRIDE | Element | Description | Likelihood | Impact | Risk | Mitigation | Status |
|----|--------|---------|-------------|------------|--------|------|------------|--------|
| T01 | S | Auth API | redirect_uri 通配 | High | High | Critical | 精确匹配 | ✅ Fixed |
| T02 | I | DB | 错误信息含 stack trace | Medium | Low | Medium | 通用错误页 | 🔄 In Progress |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

## Residual Risks
{已接受的风险 + 接受理由 + 接受人}

## Validation
- [ ] STRIDE 全元素覆盖
- [ ] 每个 Critical/High 已有 mitigation 或显式接受
- [ ] 测试用例已编写（每个 mitigation 一个）
```

## 工具

| 工具 | 类型 | 适用 |
|------|------|------|
| **Microsoft Threat Modeling Tool** | GUI | Windows 桌面，免费 |
| **OWASP Threat Dragon** | Web/Desktop | 开源跨平台 |
| **IriusRisk** | Enterprise | 商业，自动化威胁库 |
| **PyTM** | Code-as-model | 用 Python 写威胁模型 |

PyTM 示例（Threat-Model-as-Code）：

```python
from pytm import TM, Server, Datastore, Dataflow, Boundary

tm = TM("OAuth Flow")
internet = Boundary("Internet")
dmz = Boundary("DMZ")

user = Server("User Browser", boundary=internet)
auth = Server("Auth Service", boundary=dmz)
db = Datastore("User DB", boundary=dmz)

Dataflow(user, auth, "auth_code")
Dataflow(auth, db, "user_lookup")

tm.process()  # 自动生成 STRIDE 报告
```

## AI 系统的威胁建模

LLM/Agent 系统有传统建模忽略的威胁面：

| 威胁 | STRIDE 类 | 例 |
|------|-----------|-----|
| 训练数据投毒 | T (Tampering) | 公开数据集污染 |
| 模型窃取 | I (Disclosure) | API 探测 → 蒸馏 |
| 推理时 Prompt 注入 | E (Elevation) | 工具越权 |
| 输出操纵 | T | RAG 投毒 → 幻觉 |
| 隐私推理 | I | Membership inference 攻击 |
| 资源放大 | D | Token 耗尽攻击 |

参见 [defending-applications/llm-appsec.md](../../defending-applications/references/llm-appsec.md) 的细节防御。

## 收口

- 威胁建模文档**版控** + commit 到代码仓库
- 每次架构 RFC 必须配威胁模型 delta
- 安全评审（threat modeling review）作为 PR 模板可选项
