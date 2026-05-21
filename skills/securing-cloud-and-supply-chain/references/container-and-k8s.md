---
name: container-and-k8s
description: 容器与 Kubernetes 加固。容器逃逸防御、RBAC 最小权限、Pod Security Standards、NetworkPolicy、Service Mesh mTLS、Admission Control。
---

# 容器与 Kubernetes 加固

## 容器逃逸面

容器不是安全边界，只是 namespace + cgroup 的一层薄膜。逃逸 = 拿到 host root。

### 致命配置 1：privileged

```yaml
# ❌ 灾难：privileged 等于关闭所有隔离
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: bad
    image: app:1.0
    securityContext:
      privileged: true   # 容器内可挂载 host 设备、加载内核模块、cap_sys_admin
```

逃逸路径：`mount /dev/sda1 /host && chroot /host` 或者 `unshare --mount` 操作 host cgroup release_agent。

```yaml
# ✅ 显式 capability，明确 drop ALL
spec:
  containers:
  - name: good
    image: app@sha256:abc...   # digest, not tag
    securityContext:
      privileged: false
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      runAsUser: 10001
      capabilities:
        drop: ["ALL"]
        add: ["NET_BIND_SERVICE"]   # 只在确实需要 < 1024 端口时
      seccompProfile:
        type: RuntimeDefault
```

### 致命配置 2：hostPath / hostNetwork / hostPID

```yaml
# ❌ hostPath 挂载 / 等于把 host 文件系统送进容器
volumes:
- name: host-root
  hostPath:
    path: /
    type: Directory

# ❌ hostPID 让容器看到 host 进程，配合 nsenter 直接逃
spec:
  hostPID: true
  hostNetwork: true   # 共享 host 网络栈，绕过 NetworkPolicy
```

`hostPath: /var/run/docker.sock` 是经典反模式：容器内有 docker client 即可 `docker run --privileged -v /:/host` 拉新容器逃逸。生产严禁。

### 致命配置 3：Docker socket 挂载

```yaml
# ❌ 给 CI runner 挂 docker.sock = 给它 host root
volumeMounts:
- name: docker-sock
  mountPath: /var/run/docker.sock
volumes:
- name: docker-sock
  hostPath:
    path: /var/run/docker.sock

# ✅ 改用 rootless buildkit / kaniko / sysbox，构建在 user namespace 里
# kaniko 示例：
containers:
- name: kaniko
  image: gcr.io/kaniko-project/executor:v1.20.0
  args: ["--dockerfile=Dockerfile", "--destination=registry/app:${TAG}", "--no-push=false"]
```

### 内核漏洞：Dirty Pipe / Dirty COW / OverlayFS

CVE-2022-0847 (Dirty Pipe) 让普通容器写入 host 任意只读文件，覆盖 /etc/passwd 即提权。CVE-2023-0386 (OverlayFS) 在某些挂载下允许 setuid 写。

防御：内核及时打补丁；启用 seccomp default profile 限制系统调用；运行时检测 (Falco / Tetragon) 监 `/etc/shadow` 写入、ptrace、unshare。

## RBAC 最小权限

### ClusterRole vs Role

- `Role`：namespace 内权限。**默认就用这个**。
- `ClusterRole`：跨 namespace 或 cluster 资源 (nodes, PV, CRD)。需要才用。

### verb 收敛

```yaml
# ❌ 给 deployer 全权限
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
subjects:
- kind: ServiceAccount
  name: deployer
  namespace: ci
roleRef:
  kind: ClusterRole
  name: cluster-admin   # 灾难
  apiGroup: rbac.authorization.k8s.io

# ✅ 精确到 verb + resourceNames
kind: Role
metadata:
  name: deployer
  namespace: app
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  resourceNames: ["web", "api"]   # 只能改这两个
  verbs: ["get", "patch"]          # 不给 create/delete
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get"]
```

危险动词组合：`secrets:get` + `pods/exec` = 凭证落地 + 任意命令；`escalate` + `bind` = 自我提权到 cluster-admin；`nodes/proxy` = 直连 kubelet API 绕审计。

### Service Account Token 自动挂载

```yaml
# ❌ 默认所有 Pod 自动挂 SA token，污染攻击面
spec:
  serviceAccountName: default

# ✅ 不需要 K8s API 的业务 Pod 显式关闭
spec:
  automountServiceAccountToken: false
# 或在 SA 上：
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
automountServiceAccountToken: false
```

## Pod Security Standards (PSS)

K8s 1.25+ PSP 已删除，改用 PSS + namespace label。

| 等级 | 用途 | 关键限制 |
|------|------|---------|
| `privileged` | kube-system / 节点组件 | 无限制 |
| `baseline` | 通用业务 | 禁 hostPath、hostNetwork、privileged、危险 capability |
| `restricted` | 多租户 / 高敏 | 强制 runAsNonRoot、seccomp RuntimeDefault、drop ALL caps |

```yaml
# ✅ namespace 启用 restricted
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/audit: restricted     # 违规审计
    pod-security.kubernetes.io/warn: restricted      # kubectl 警告
```

## NetworkPolicy 默认拒绝

K8s 默认 Pod 间全互通。第一条策略必须是 namespace 级 default deny。

```yaml
# ✅ 默认拒绝所有 ingress + egress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: app
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
---
# 然后按需放行
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-allow
spec:
  podSelector:
    matchLabels: {app: web}
  policyTypes: [Ingress, Egress]
  ingress:
  - from:
    - podSelector: {matchLabels: {app: gateway}}
    ports: [{protocol: TCP, port: 8080}]
  egress:
  - to:
    - podSelector: {matchLabels: {app: db}}
    ports: [{protocol: TCP, port: 5432}]
  - to:                       # DNS 必放，否则解析全挂
    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: kube-system}}
      podSelector: {matchLabels: {k8s-app: kube-dns}}
    ports: [{protocol: UDP, port: 53}]
```

Cilium / Calico 扩展能力：L7 规则 (HTTP method/path)、FQDN 出站策略、`CiliumClusterwideNetworkPolicy`、identity-based policy（不依赖 IP）。Cilium Tetragon 可做内核级 syscall 监控替代 Falco。

## Secrets 管理

```yaml
# ❌ ConfigMap 存密码，base64 不是加密
apiVersion: v1
kind: ConfigMap
data:
  DB_PASSWORD: "supersecret"

# ❌ Secret 进 git，即便加了 .gitignore 历史也带不走
# k8s Secret 在 etcd 默认明文（除非启用 EncryptionConfiguration）

# ✅ External Secrets Operator (ESO) - 实时拉 Vault/AWS SM
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-creds
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-secret
  data:
  - secretKey: password
    remoteRef:
      key: secret/data/app/db
      property: password
```

Sealed Secrets (Bitnami)：把 Secret 用集群公钥加密，密文可入 git，集群 controller 解密。适合 GitOps，但密钥轮换需重新封印。

etcd 加密：启用 `EncryptionConfiguration` 用 KMS provider（AWS KMS / GCP KMS / Vault Transit），不要用静态 aescbc key 长期不换。

## 镜像安全

```dockerfile
# ❌ ubuntu:latest 含 200+ 包，每个都是攻击面；root 默认运行
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3
COPY app.py /
CMD ["python3", "/app.py"]

# ✅ distroless + non-root + multi-stage
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM gcr.io/distroless/python3-debian12:nonroot
COPY --from=builder /root/.local /home/nonroot/.local
COPY --chown=nonroot:nonroot app.py /app/
USER nonroot
ENV PATH=/home/nonroot/.local/bin:$PATH
WORKDIR /app
ENTRYPOINT ["python3", "app.py"]
```

镜像引用：

```yaml
# ❌ tag 可被覆盖
image: registry.example.com/app:v1.2.3

# ✅ digest 不可变
image: registry.example.com/app@sha256:7d3a9c8e...
```

签名验证 (cosign + sigstore)：

```bash
# 签名（CI 中用 keyless OIDC，无需私钥）
cosign sign --yes registry.example.com/app@sha256:7d3a9c8e...

# 集群准入校验
# Sigstore policy-controller 或 Kyverno verifyImages
```

## Service Mesh：mTLS 强制

Istio / Linkerd 默认开 mTLS，但要锁 STRICT 模式。

```yaml
# ❌ PERMISSIVE 允许明文回退
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: PERMISSIVE   # 攻击者可降级

# ✅ STRICT 全集群强制
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
---
# AuthorizationPolicy 默认拒绝 + 白名单
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: default-deny
  namespace: app
spec: {}   # 空 spec = 拒绝所有
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: api-allow
  namespace: app
spec:
  selector:
    matchLabels: {app: api}
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/app/sa/gateway"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/v1/*"]
```

零信任 east-west：mTLS + AuthorizationPolicy + NetworkPolicy 三层叠加。mesh 出问题时，NetworkPolicy 仍兜底。

## 准入控制：OPA Gatekeeper / Kyverno

```yaml
# ✅ Kyverno 拒绝 latest tag + 强制 resource limits
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-image-digest
spec:
  validationFailureAction: Enforce
  rules:
  - name: disallow-latest-tag
    match:
      any:
      - resources:
          kinds: [Pod]
    validate:
      message: "image must use digest, not tag"
      pattern:
        spec:
          containers:
          - image: "*@sha256:*"
  - name: require-resource-limits
    match:
      any:
      - resources:
          kinds: [Pod]
    validate:
      message: "cpu/memory limits required"
      pattern:
        spec:
          containers:
          - resources:
              limits:
                memory: "?*"
                cpu: "?*"
              requests:
                memory: "?*"
                cpu: "?*"
```

OPA Gatekeeper 用 Rego，表达力更强但学习曲线陡；Kyverno 用 K8s YAML 风格，团队上手快。新项目优先 Kyverno，已有 Rego 资产用 Gatekeeper。

## 检测点 (运行时)

| 信号 | 工具 | 含义 |
|------|------|------|
| Pod 内执行 `nsenter` / `unshare` | Falco / Tetragon | 逃逸尝试 |
| 容器内访问 `/var/run/docker.sock` | Falco | docker socket 滥用 |
| K8s API 异常调用 `pods/exec` | audit log | 横向移动 |
| ServiceAccount token 离开集群 IP | egress NetworkPolicy + 流量分析 | token 外泄 |
| 镜像 pull 来源非白名单 registry | admission policy | 供应链异常 |
| Pod 突然 `runAsUser: 0` | PSS audit | 权限漂移 |
