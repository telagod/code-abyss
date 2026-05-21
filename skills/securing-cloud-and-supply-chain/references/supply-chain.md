---
name: supply-chain
description: 软件供应链安全。SLSA、Sigstore、SBOM、CI/CD 加固、依赖审计、Provenance/Attestation、VEX。
---

# 软件供应链安全

## 攻击模型：历史教训

| 事件 | 路径 | 教训 |
|------|------|------|
| SolarWinds (2020) | 构建环境被植入，污染合法签名的 dll | 构建机即信任根，必须隔离、审计、可重现 |
| Codecov (2021) | bash uploader 被改，CI 中 secret 被外传 | CI 中拉远端脚本必须 pin hash |
| event-stream (2018) | 维护者交接给恶意者，新版本注入 BTC 钱包窃取代码 | 依赖维护者变更需告警；锁版本+审计 |
| left-pad (2016) | 11 行包被撤回导致全网构建失败 | 私有 mirror / 缓存 / lockfile |
| ua-parser-js (2021) | 包仓账号被劫持发恶意版本 | 维护者 2FA + provenance |
| dependency confusion (2021) | 内部包名在公仓注册，CI 优先拉公仓 | scope/registry 显式锁定 |
| xz-utils (2024) | 长期渗透维护者社区注入后门 | 关键依赖审计 + reproducible build |

## SLSA Levels 实操

SLSA (Supply-chain Levels for Software Artifacts) 定义构建可信等级。**别盲目追 L4，按业务定级**。

| Level | 要求 | 何时够用 |
|-------|------|---------|
| L1 | 有构建脚本 + provenance（可不签名） | 内部工具、原型 |
| L2 | 托管构建 (GitHub Actions / GitLab CI) + 签名 provenance | 中等业务，绝大多数 SaaS 起步线 |
| L3 | 隔离构建环境 (ephemeral runner) + non-falsifiable provenance | 金融、医疗、关键基础设施 |
| L4 | 双人审核 + reproducible builds | 操作系统、编译器、加密库 |

L3 现实路径：用 GitHub-hosted runner（每次任务全新 VM）+ `slsa-github-generator` 自动产 provenance + sigstore 签名。

```yaml
# ✅ GitHub Actions L3 构建链
name: build
on: [push]
permissions:
  contents: read
  id-token: write   # OIDC for sigstore
  attestations: write
jobs:
  build:
    runs-on: ubuntu-latest   # ephemeral
    outputs:
      digest: ${{ steps.build.outputs.digest }}
    steps:
    - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11   # pin hash
    - id: build
      run: |
        docker build -t app:${{ github.sha }} .
        DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' app:${{ github.sha }})
        echo "digest=$DIGEST" >> $GITHUB_OUTPUT
    - uses: actions/attest-build-provenance@v1
      with:
        subject-name: ghcr.io/org/app
        subject-digest: ${{ steps.build.outputs.digest }}
        push-to-registry: true
```

## Sigstore：cosign / fulcio / rekor

三件套：
- **fulcio** — 短期证书 CA，认 OIDC 身份签证书（GitHub / Google / 邮箱）
- **rekor** — 透明日志，记录所有签名，append-only，可审计
- **cosign** — 客户端工具

```bash
# ❌ 长期 GPG key 签 release，私钥泄漏全完
gpg --sign release.tar.gz

# ✅ keyless 签名，OIDC 验证身份，证书 10 分钟过期
cosign sign-blob --yes \
  --output-signature release.sig \
  --output-certificate release.crt \
  release.tar.gz

# 验证（任何人，无需密钥）
cosign verify-blob \
  --signature release.sig \
  --certificate release.crt \
  --certificate-identity "https://github.com/org/repo/.github/workflows/release.yml@refs/tags/v1.0.0" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  release.tar.gz
```

镜像签名链路：

```bash
# 签名
cosign sign ghcr.io/org/app@sha256:abc123

# K8s 准入校验（policy-controller / Kyverno）
# Kyverno verifyImages：
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-images
spec:
  validationFailureAction: Enforce
  rules:
  - name: verify-signature
    match:
      any:
      - resources: {kinds: [Pod]}
    verifyImages:
    - imageReferences: ["ghcr.io/org/*"]
      attestors:
      - entries:
        - keyless:
            subject: "https://github.com/org/repo/.github/workflows/release.yml@refs/tags/*"
            issuer: "https://token.actions.githubusercontent.com"
```

## SBOM：CycloneDX vs SPDX

SBOM (Software Bill of Materials) 是依赖清单，必须随 release 一起发。

| 格式 | 阵营 | 强项 |
|------|------|------|
| CycloneDX | OWASP | 漏洞 / VEX / 服务依赖描述强 |
| SPDX | Linux Foundation | 许可证合规、ISO 标准 |

实战：用 Syft 生成，Grype 扫描。

```bash
# ❌ 只跑 Trivy 扫镜像就交差，没产物可审计
trivy image app:latest

# ✅ 生成 + 签名 + 附加到镜像
syft ghcr.io/org/app@sha256:abc -o cyclonedx-json > sbom.cdx.json

# 漏洞扫
grype sbom:./sbom.cdx.json --fail-on high

# 把 SBOM 作为 attestation 附到镜像
cosign attest --yes \
  --predicate sbom.cdx.json \
  --type cyclonedx \
  ghcr.io/org/app@sha256:abc

# 验证
cosign verify-attestation --type cyclonedx \
  --certificate-identity "..." \
  --certificate-oidc-issuer "..." \
  ghcr.io/org/app@sha256:abc
```

## 依赖审计

| 生态 | 审计 | 自动修复 |
|------|------|---------|
| npm | `npm audit` / `pnpm audit` / Socket.dev | Renovate / Dependabot |
| Python | `pip-audit` / `safety` | Renovate |
| Go | `govulncheck` (官方，调用图分析) | Renovate |
| Rust | `cargo audit` / `cargo deny` | Dependabot |
| Java | OWASP dependency-check / `mvn versions:display-dependency-updates` | Renovate |

govulncheck 关键：它分析**实际调用链**，不报告"装了但没用"的漏洞，比 CVE 数据库扫描精准得多。

```bash
# Go 项目
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
```

Renovate 配置：

```json
{
  "extends": ["config:recommended"],
  "vulnerabilityAlerts": {"enabled": true, "labels": ["security"]},
  "lockFileMaintenance": {"enabled": true, "schedule": ["before 5am on monday"]},
  "packageRules": [
    {
      "matchUpdateTypes": ["major"],
      "automerge": false
    },
    {
      "matchUpdateTypes": ["patch"],
      "matchPackagePatterns": ["*"],
      "automerge": true,
      "automergeType": "pr"
    }
  ]
}
```

## CI/CD pipeline 加固

### OIDC 替代长期密钥

```yaml
# ❌ AWS access key 存 GitHub Secret，泄漏即灾
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_KEY }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET }}

# ✅ OIDC 联邦，临时凭证 1 小时过期
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    steps:
    - uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeploy
        aws-region: us-east-1
        # 信任策略限定到具体 repo + branch + workflow
```

AWS 信任策略示例：

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"},
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:org/repo:ref:refs/heads/main"
      }
    }
  }]
}
```

⚠️ `sub` 必须用 `StringLike` 限定 ref。只用 `StringEquals` 到 repo 而不限 ref，任意 fork PR 可冒充 main。

### Ephemeral runner

self-hosted runner 必须每个 job 全新销毁（`actions-runner-controller` + ephemeral mode），永久 runner 是横向移动跳板。

### secret rotation

- CI 中 secret 每 90 天轮换
- 任何 commit 含 token 立即视为泄漏（GitGuardian / TruffleHog 扫描）
- 用 sops / git-crypt / SOPS+age 加密入库的配置

## GitHub Actions 特有风险

### pull_request_target

```yaml
# ❌ pull_request_target 在 base 分支上下文跑，能访问 secret
# 攻击者从 fork 提 PR 改 workflow → 偷 secret
on:
  pull_request_target:
    types: [opened, synchronize]
jobs:
  test:
    steps:
    - uses: actions/checkout@v4
      with:
        ref: ${{ github.event.pull_request.head.sha }}   # checkout 不可信代码
    - run: npm test   # 跑攻击者代码 + 有 secret 访问权

# ✅ 用 pull_request（fork PR 默认无 secret）
on:
  pull_request:
jobs:
  test:
    permissions:
      contents: read
    steps:
    - uses: actions/checkout@v4
    - run: npm test
```

如果必须用 `pull_request_target`（比如给 PR 打标签），分两个 workflow：一个 `pull_request` 跑测试（无 secret），一个 `workflow_run` 在前者完成后做需要 secret 的事。

### action pin hash

```yaml
# ❌ 用 tag，攻击者改 tag 指向恶意 commit
- uses: actions/checkout@v4

# ✅ pin commit SHA
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11   # v4.1.1
```

第三方 action 必须 pin SHA + 加注释。Dependabot 可自动更新 SHA pin。

### permissions 最小化

```yaml
# ❌ 默认 GITHUB_TOKEN 有 write 权限
# ✅ workflow 顶层显式 read-only，job 内按需提权
permissions:
  contents: read
jobs:
  release:
    permissions:
      contents: write     # 创建 release
      id-token: write     # OIDC
      packages: write     # push 镜像
```

## Provenance & Attestation

in-toto 是 attestation 框架；GitHub provenance / npm provenance 是其落地。

```bash
# npm provenance（Node 16.14+）
npm publish --provenance --access public
# CI 中需要 id-token: write
# 发布后包页面显示 "Built and signed on GitHub Actions"
```

验证：

```bash
npm install --foreground-scripts pkg-name
npm audit signatures   # 检查 provenance 完整性
```

## VEX (Vulnerability Exploitability eXchange)

不是所有 CVE 都"利用得到"。VEX 是产品方对 CVE 的状态声明：

| 状态 | 含义 |
|------|------|
| `not_affected` | 代码不调用受影响的函数 |
| `affected` | 受影响，需修复 |
| `fixed` | 已在版本 X 修复 |
| `under_investigation` | 正在评估 |

```json
// CycloneDX VEX 片段
{
  "vulnerabilities": [{
    "id": "CVE-2024-12345",
    "source": {"name": "NVD"},
    "analysis": {
      "state": "not_affected",
      "justification": "vulnerable_code_not_in_execute_path",
      "detail": "We use lib X but only call function Y, not the vulnerable Z"
    },
    "affects": [{"ref": "pkg:maven/com.example/app@1.0.0"}]
  }]
}
```

发 VEX 让客户安全团队不用反复问"这个 CVE 你们影响吗"。OpenVEX、CSAF VEX、CycloneDX VEX 三种格式，OpenVEX 最简单。

## CI/CD 红线规则

| 红线 | 检测 |
|------|------|
| Action 用 tag 而非 SHA | grep `uses:.*@v[0-9]` |
| `pull_request_target` + `actions/checkout` head | grep workflow |
| `permissions:` 缺失 / 全 write | gh-actions-audit |
| 长期 cloud key 在 secrets | 定期审计 + 切 OIDC |
| 镜像 push 不签名 | registry policy |
| release 无 provenance | release gate |
| 依赖 lockfile 缺失 | CI 检查 |
| 关键依赖单一维护者 | Scorecard / deps.dev 审计 |
