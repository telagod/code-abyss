---
name: cloud-iam-and-secrets
description: 云 IAM、Secrets 管理、IaC 安全。AWS/GCP/Azure 权限策略、AssumeRole、Vault/KMS、Terraform 安全、Workload Identity。
---

# 云 IAM 与 Secrets 管理

## AWS IAM 反模式

### 反模式 1：通配 Action / Resource

```json
// ❌ 等于 root：dev "暂时"用一下，三年没改
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
  }]
}

// ❌ 自以为限制了，其实 s3:* 包含 PutBucketPolicy 等，可自我提权
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// ✅ 收敛到具体 Action + Resource ARN
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadAppBucket",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::app-data-prod",
      "arn:aws:s3:::app-data-prod/*"
    ]
  }]
}
```

用 IAM Access Analyzer 生成"实际用到的权限"基线，砍掉未使用 Action。CloudTrail 数据事件 + Athena 查 90 天调用，是收敛的事实依据。

### 反模式 2：iam:PassRole 滥用

```json
// ❌ 给 EC2 服务 PassRole 任意角色 = 提权到任意角色
{
  "Effect": "Allow",
  "Action": "iam:PassRole",
  "Resource": "*"
}

// ✅ 限定可传角色 + 限定接收服务
{
  "Effect": "Allow",
  "Action": "iam:PassRole",
  "Resource": "arn:aws:iam::123456789012:role/AppEC2Role",
  "Condition": {
    "StringEquals": {"iam:PassedToService": "ec2.amazonaws.com"}
  }
}
```

PassRole 是云上经典提权：拿到 `lambda:CreateFunction` + `iam:PassRole *`，攻击者建一个 Lambda 用高权限角色跑任意代码。

### 反模式 3：跨账号 trust 失误

```json
// ❌ 信任整个 account，对方任何 IAM 实体都能 assume
{
  "Effect": "Allow",
  "Principal": {"AWS": "arn:aws:iam::222222222222:root"},
  "Action": "sts:AssumeRole"
}

// ❌ 信任 *，灾难（曾发生 confused deputy 攻击）
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "sts:AssumeRole"
}

// ✅ 限定具体 role + ExternalId（防止 confused deputy）
{
  "Effect": "Allow",
  "Principal": {"AWS": "arn:aws:iam::222222222222:role/PartnerService"},
  "Action": "sts:AssumeRole",
  "Condition": {
    "StringEquals": {"sts:ExternalId": "<unique-customer-id>"}
  }
}
```

## 服务账号 vs 用户账号

| 场景 | 用 |
|------|---|
| 工作负载 (EC2 / Lambda / Pod) | **IAM Role** + instance profile / IRSA / Pod Identity |
| 人 (开发 / 运维) | **IAM Identity Center (SSO)** + 临时凭证 |
| CI/CD | **OIDC federation**（不要长期 access key） |
| 第三方 SaaS | **跨账号 Role** + ExternalId |

绝不用 IAM User + 长期 access key 跑生产工作负载。AccessKey 出现在代码、laptop、CI 历史里就是定时炸弹。

## IAM 条件：纵深防御

```json
// ✅ 强制 MFA + 限制 IP + session 时长
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*",
  "Condition": {
    "Bool": {"aws:MultiFactorAuthPresent": "true"},
    "NumericLessThan": {"aws:MultiFactorAuthAge": "3600"},
    "IpAddress": {"aws:SourceIp": ["198.51.100.0/24"]},
    "DateGreaterThan": {"aws:CurrentTime": "2026-01-01T00:00:00Z"}
  }
}
```

`aws:PrincipalOrgID` 限定调用方必须来自本组织：

```json
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": {
    "StringNotEquals": {"aws:PrincipalOrgID": "o-xxxxxxxxxx"}
  }
}
```

## 三层组合：AssumeRole + SCP + Permission Boundary

| 层 | 作用 | 谁设 |
|----|------|------|
| **SCP** (Service Control Policy) | 组织级别黑名单/白名单，账号管理员都改不了 | 安全/合规 |
| **Permission Boundary** | 限定 IAM 实体最大权限上限 | 平台团队 |
| **Identity Policy** | 实际授予的权限 | 应用 owner |
| **Resource Policy** | 资源端访问控制 (S3 bucket policy / KMS key policy) | 资源 owner |

有效权限 = SCP ∩ Boundary ∩ Identity ∩ Resource。任一层 Deny 即拒绝。

```json
// ✅ SCP：禁止任何人关闭 CloudTrail / GuardDuty / Config
{
  "Effect": "Deny",
  "Action": [
    "cloudtrail:StopLogging",
    "cloudtrail:DeleteTrail",
    "guardduty:DeleteDetector",
    "config:StopConfigurationRecorder"
  ],
  "Resource": "*"
}
```

```json
// ✅ Permission Boundary：开发自助创建 Role 但不能超出此边界
{
  "Effect": "Allow",
  "Action": ["s3:*", "dynamodb:*", "logs:*"],
  "Resource": "*",
  "Condition": {
    "StringEquals": {"aws:RequestedRegion": "us-east-1"}
  }
}
```

## Secrets 管理

| 工具 | 强项 | 弱点 |
|------|------|------|
| HashiCorp Vault | 多 backend、动态凭证、transit 加密 | 自托管运维成本 |
| AWS Secrets Manager | 自动轮换、KMS 集成、无运维 | 仅 AWS |
| GCP Secret Manager | 简单、IAM 集成 | 无内建轮换（需 Cloud Functions） |
| Azure Key Vault | HSM 选项、企业 RBAC | API 模型复杂 |
| 1Password / Doppler | 团队 secret + dev 友好 | 不适合 runtime |

### 反模式

```bash
# ❌ env 文件入 git
echo "DATABASE_URL=postgres://user:pass@..." > .env
git add .env

# ❌ Dockerfile ARG 里塞 secret，build cache 一并保留
FROM alpine
ARG API_KEY
RUN curl -H "Authorization: $API_KEY" ...

# ❌ K8s Secret 当 ConfigMap 用，base64 不是加密

# ✅ 启动时拉
export DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id prod/db --query SecretString --output text | jq -r .url)

# ✅ Vault dynamic database credentials（每次连接生成临时账号）
vault read database/creds/app-readonly
# 返回 username/password TTL=1h，过期自动失效
```

### 旋转策略

- 静态 secret：90 天强制轮换（Lambda + Secrets Manager rotation schedule）
- 数据库凭证：用 Vault dynamic secret，TTL 1-24h
- API key：调用方支持版本切换（先发新、双跑、撤旧）
- 怀疑泄漏：立即撤销 + 审计调用记录 + 通知用户

## KMS：CMK vs AWS Managed

| 类型 | 用途 |
|------|------|
| AWS Managed (`aws/s3` 等) | 默认加密，无密钥策略控制 |
| Customer Managed (CMK) | 应用级、跨账号共享、密钥策略可定制 |
| Customer Provided (CPK/XKS) | 你持有密钥材料，KMS 仅做封装 |

生产敏感数据**一律 CMK**，因为：能控制 key policy（哪些 IAM 实体能 Decrypt）；CloudTrail 记录每次解密；可禁用密钥即刻断访问。

### Envelope encryption

```python
# ✅ 数据用 DEK 加密，DEK 用 CMK 加密保存
import boto3
from cryptography.fernet import Fernet

kms = boto3.client('kms')

# 加密
resp = kms.generate_data_key(KeyId='alias/app-cmk', KeySpec='AES_256')
plaintext_key = resp['Plaintext']
encrypted_key = resp['CiphertextBlob']   # 存储这个，不存明文

cipher = Fernet(base64.urlsafe_b64encode(plaintext_key))
ciphertext = cipher.encrypt(b"sensitive data")
# 存 (ciphertext, encrypted_key) 到数据库

# 解密
plaintext_key = kms.decrypt(CiphertextBlob=encrypted_key)['Plaintext']
cipher = Fernet(base64.urlsafe_b64encode(plaintext_key))
plaintext = cipher.decrypt(ciphertext)
```

跨区复制：multi-region key 自动同步密钥材料，灾备/合规场景必备。

## IaC 安全：Terraform

### 反模式 1：硬编码秘密

```hcl
# ❌ 密钥进 .tf 文件 → 进 git → state 也带
resource "aws_db_instance" "main" {
  username = "admin"
  password = "supersecret123"   # 灾难
}

# ✅ 从 Secrets Manager 读
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "prod/db/master"
}

resource "aws_db_instance" "main" {
  username = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)["username"]
  password = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)["password"]

  manage_master_user_password = true   # 更好：让 RDS 自管 + 自动轮换
}
```

### 反模式 2：state 公开 / 明文

```hcl
# ❌ 本地 state，多人协作冲突 + state 含明文 secret
terraform {
  # 无 backend，默认 local
}

# ❌ S3 backend 但没加密、没 lock
terraform {
  backend "s3" {
    bucket = "tfstate"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

# ✅ 加密 + lock + 版本
terraform {
  backend "s3" {
    bucket         = "tfstate-prod-locked"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:123456789012:key/abc..."
    dynamodb_table = "terraform-locks"
  }
}
# bucket 必须：versioning、block public、KMS 加密、access logging
```

state 必须当作 secret 处理：里面存 RDS 密码、TLS 私钥、API token。仅 SRE 团队可读。

### 反模式 3：drift 不管

人在控制台手改资源后，下次 apply 会冲突或回滚生产配置。

```bash
# 定期 drift detection
terraform plan -detailed-exitcode
# exit 2 = 有 drift
```

CI 中跑 `terraform plan` + 阻断 unexpected diff；用 Atlantis / Terraform Cloud 做 PR-based workflow，禁掉本地 apply。

### 静态扫描

```bash
# Checkov：策略即代码，覆盖 AWS/Azure/GCP/K8s/Dockerfile
checkov -d ./terraform --framework terraform

# tfsec / trivy config：更轻量
trivy config ./terraform

# Terrascan：OPA Rego 规则
terrascan scan -i terraform -d ./terraform
```

CI gate 示例：

```yaml
- name: Checkov
  run: checkov -d . --framework terraform --soft-fail-on LOW --hard-fail-on HIGH,CRITICAL
```

## 云原生秘密注入

K8s Pod 拿云端 secret 的演进：

```yaml
# ❌ 把 access key 塞进 Secret 给 Pod 用
apiVersion: v1
kind: Secret
data:
  AWS_ACCESS_KEY_ID: <base64>
  AWS_SECRET_ACCESS_KEY: <base64>

# ✅ Pod Identity (EKS Pod Identity / IRSA / GKE Workload Identity / AKS Workload Identity)
# Pod 通过 SA 自动获取临时云凭证，无静态密钥
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: app
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/AppRole
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      serviceAccountName: app-sa
      # SDK 自动用 IRSA 获取 STS 凭证
```

### CSI Secret Store Driver

直接把云端 secret 挂载为 Pod 文件，**绕过 K8s Secret**：

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: app-secrets
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "prod/app/db"
        objectType: "secretsmanager"
---
# Pod 中
volumes:
- name: secrets
  csi:
    driver: secrets-store.csi.k8s.io
    readOnly: true
    volumeAttributes:
      secretProviderClass: "app-secrets"
volumeMounts:
- name: secrets
  mountPath: "/mnt/secrets"
  readOnly: true
```

好处：secret 不进 etcd；轮换可自动同步；不暴露给 RBAC `secrets:get`。

## 检测红线

| 信号 | 工具 | 含义 |
|------|------|------|
| `iam:CreateAccessKey` 异常 | CloudTrail + GuardDuty | 长期密钥被生成（疑提权） |
| `s3:PutBucketPolicy` 改为 public | Config rule | 数据公开 |
| `kms:Decrypt` 异常账号 | CloudTrail | 跨账号解密 |
| AssumeRole 来自异常 IP/UA | GuardDuty + CloudTrail | 凭证劫持 |
| Terraform state 文件被人下载 | S3 access log | state 泄漏 |
| Secrets Manager `GetSecretValue` 频次激增 | CloudTrail | 凭证扫荡 |
