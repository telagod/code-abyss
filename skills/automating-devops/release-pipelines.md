---
name: release-pipelines
description: Release pipeline 编排 recipe。完整 release.yml 多 job 拓扑（cross-platform binary + SBOM + multi-arch image + cosign sign + GitHub Release）、metadata-action tag 决策、踩坑字典。当用户提到 release pipeline、release.yml、版本发布、ghcr 镜像发布、多架构镜像、cosign 签名编排、cargo-deny 调参、SBOM 集成时使用。
---

# 炼器秘典 · Release Pipeline 编排

> 安全机制查 [supply-chain](../securing-cloud-and-supply-chain/references/supply-chain.md)；本文专攻**多 job 编排骨架 + 真实踩坑字典**。

## 何时用本文

| 场景 | 用 |
|------|----|
| 第一次给项目搭 release pipeline，要可复制骨架 | ✅ |
| 已有 pipeline 但 tag → 镜像 → SBOM → 签名链路断点排查 | ✅ |
| Rust 项目专项（cargo-cyclonedx / cargo-deny / cross 编译） | ✅ |
| 想理解 cosign / SLSA 的**为什么** | → supply-chain |
| 选 K8s 准入策略 / Kyverno verifyImages | → supply-chain / container-and-k8s |

## 拓扑全图

```
                       tag push (v*.*.*)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   build-binaries         sbom (源码层)        build-image
   ├─ linux-x86_64        cargo-cyclonedx      buildx multi-arch
   ├─ linux-aarch64       上传 artifact         provenance: mode=max
   └─ darwin-aarch64                            sbom: true (容器层)
        │                     │                     │
        │                     └────────┬────────────┤
        │                              │            │
        │                         sign-image  ◄─────┘
        │                         cosign sign + attest
        │                              │
        └──────────────► gh release ◄──┘
                        softprops/action-gh-release
```

**关键依赖**：

- `sign-image` 必须 `needs: [build-image, sbom]` —— 没 digest 没法签，没 SBOM 没法 attest
- `build-binaries` 与 `build-image` 可并行，省时间
- `gh release` 收口，不阻塞镜像签名

## 完整骨架（Rust 起步，从 ctxward v0.2.0 实战提炼）

```yaml
name: release

on:
  push:
    tags: ["v*.*.*"]
  workflow_dispatch:
    inputs:
      tag:
        description: "Tag to release (e.g. v0.2.0)"
        required: true
        type: string

permissions:
  contents: write       # gh release create
  packages: write       # ghcr push
  id-token: write       # cosign keyless OIDC
  attestations: write   # SLSA provenance

env:
  IMAGE_NAME: ghcr.io/${{ github.repository_owner }}/myapp

jobs:
  # ─────────────────────────────────────────────────────────
  # 1. cross-platform binary
  # ─────────────────────────────────────────────────────────
  build-binaries:
    name: binary (${{ matrix.target }})
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
          - os: ubuntu-latest
            target: aarch64-unknown-linux-gnu
            cross: true
          - os: macos-14            # Apple Silicon
            target: aarch64-apple-darwin
          # x86_64-apple-darwin 见「踩坑字典 · macos-13 throttle」
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with: { targets: "${{ matrix.target }}" }
      - uses: Swatinem/rust-cache@v2
        with: { key: "${{ matrix.target }}" }

      - name: Install cross (linux aarch64)
        if: matrix.cross
        run: cargo install --locked cross

      - name: Build
        run: |
          if [ "${{ matrix.cross }}" = "true" ]; then
            cross build --release --locked --target ${{ matrix.target }}
          else
            cargo build --release --locked --target ${{ matrix.target }}
          fi

      - name: Package
        id: pkg
        run: |
          set -euo pipefail
          VERSION="${GITHUB_REF_NAME:-${{ inputs.tag }}}"
          NAME="myapp-${VERSION}-${{ matrix.target }}"
          mkdir -p "dist/${NAME}"
          cp "target/${{ matrix.target }}/release/myapp" "dist/${NAME}/"
          cp LICENSE README.md "dist/${NAME}/"
          tar -C dist -czf "dist/${NAME}.tar.gz" "${NAME}"
          (cd dist && sha256sum "${NAME}.tar.gz" > "${NAME}.tar.gz.sha256")
          echo "name=${NAME}" >> "$GITHUB_OUTPUT"

      - uses: actions/upload-artifact@v4
        with:
          name: ${{ steps.pkg.outputs.name }}
          path: dist/${{ steps.pkg.outputs.name }}.tar.gz*

  # ─────────────────────────────────────────────────────────
  # 2. 源码层 SBOM (Rust)
  # ─────────────────────────────────────────────────────────
  sbom:
    name: sbom
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo install --locked cargo-cyclonedx
      - name: Generate SBOM
        run: |
          cargo cyclonedx --format json --all
          mkdir -p sbom
          find . -maxdepth 3 -name '*.cdx.json' -exec cp {} sbom/ \;
      - uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom/*.cdx.json

  # ─────────────────────────────────────────────────────────
  # 3. multi-arch container image
  # ─────────────────────────────────────────────────────────
  build-image:
    name: container image
    runs-on: ubuntu-latest
    outputs:
      digest: ${{ steps.build.outputs.digest }}
      tags: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          provenance: mode=max     # SLSA L3 provenance (buildx 内建)
          sbom: true               # 容器层 SBOM (buildx 内建)
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─────────────────────────────────────────────────────────
  # 4. cosign 签名 + 应用层 SBOM attestation
  # ─────────────────────────────────────────────────────────
  sign-image:
    name: cosign sign
    needs: [build-image, sbom]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: sigstore/cosign-installer@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Sign each tag (keyless)
        env:
          DIGEST: ${{ needs.build-image.outputs.digest }}
          TAGS: ${{ needs.build-image.outputs.tags }}
        run: |
          set -euo pipefail
          for tag in $TAGS; do
            cosign sign --yes "${tag}@${DIGEST}"
          done

      - uses: actions/download-artifact@v4
        with: { name: sbom, path: sbom-files }

      - name: Attest SBOM (CycloneDX)
        env:
          DIGEST: ${{ needs.build-image.outputs.digest }}
          TAGS: ${{ needs.build-image.outputs.tags }}
        run: |
          set -euo pipefail
          SBOM=$(find sbom-files -name '*.cdx.json' | head -n1)
          if [ -z "$SBOM" ]; then
            echo "::warning::no SBOM file found, skipping attest"
            exit 0
          fi
          for tag in $TAGS; do
            cosign attest --yes --predicate "$SBOM" --type cyclonedx "${tag}@${DIGEST}"
          done

  # ─────────────────────────────────────────────────────────
  # 5. GitHub Release
  # ─────────────────────────────────────────────────────────
  gh-release:
    name: gh release
    needs: [build-binaries, sbom]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: release
          merge-multiple: true        # 见「踩坑字典 · assets glob」
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          generate_release_notes: true
          prerelease: ${{ contains(github.ref_name, '-') }}
          files: release/*
```

## metadata-action tag 决策矩阵

| 模式 | 给什么镜像消费者用 | 适合 |
|------|-------------------|------|
| `type=semver,pattern={{version}}` | `:1.2.3` 精确钉版 | 生产 pin |
| `type=semver,pattern={{major}}.{{minor}}` | `:1.2` 跟最新 patch | 业务方愿意吃 patch |
| `type=semver,pattern={{major}}` | `:1` 跟最新 minor | 实验场景 |
| `type=raw,value=latest,enable={{is_default_branch}}` | `:latest` | 「想试试」用户 |
| `type=sha,prefix=sha-` | `:sha-abc1234` | 内部部署、回滚定位 |
| `type=ref,event=branch` | `:main` | 仅 main 分支构建跑 |

**决策原则**：

- 公开镜像至少给 `{{version}}` + `{{major}}.{{minor}}` + `latest`，覆盖三类消费心智
- `latest` 一定加 `enable={{is_default_branch}}`，否则任何 tag push 都会抢 latest
- 不要给 `{{major}}` 配 `enable={{is_default_branch}}`，重大版本 0.x → 1.x 心智混乱

## ARM64 QEMU 性能取舍

`docker/setup-qemu-action` 让 ubuntu-latest 跑 ARM64 emulation。**代价**：Rust/Go 这种重编译类项目，arm64 那一档可能慢 20-40 倍（实测 ctxward v0.2.0 single image 跑了 ~43 分钟）。

| 方案 | 时间 | 复杂度 |
|------|------|--------|
| 单 runner + QEMU emulation | 慢（30-60min） | 最简单 |
| matrix split + buildx imagetools create 合并 | 快（分头跑各 5-10min） | 中 |
| 用 `ubuntu-24.04-arm` runner 原生 ARM | 快 | 中（runner 可用性受限） |
| 用第三方 BuildJet / Depot ARM runner | 快 | 高（外部依赖） |

matrix split 模板片段：

```yaml
strategy:
  matrix:
    include:
      - platform: linux/amd64
        runner: ubuntu-latest
      - platform: linux/arm64
        runner: ubuntu-24.04-arm   # 或 buildjet-2vcpu-ubuntu-2204-arm
runs-on: ${{ matrix.runner }}
# 各自 push by digest，最后一个 merge job 跑：
# docker buildx imagetools create -t $IMAGE_NAME:$VERSION \
#   $IMAGE_NAME@sha256:amd64-digest $IMAGE_NAME@sha256:arm64-digest
```

## buildx vs 外挂 cosign 的双层 attestation

`build-push-action` 的 `provenance: mode=max` + `sbom: true` 已经把 SLSA provenance 和容器层 SBOM 推到 registry（OCI referrer）。**外挂 cosign attest 不冗余**，是身份切换 + 应用层 SBOM —— 详见 [supply-chain.md#buildx-内建-sbomprovenance-vs-外挂-cosign-attest](../securing-cloud-and-supply-chain/references/supply-chain.md)。

## 踩坑字典

实战遇到的真实失败模式，按修复优先级排：

### 1. cargo-cyclonedx `--output-cdx` 不存在

```
error: unexpected argument '--output-cdx' found
```

**原因**：早期教程或 AI 生成的 release.yml 里有这个 flag，0.5.x 已没有。
**修法**：

```yaml
# ❌
run: cargo cyclonedx --format json --output-cdx
# ✅ workspace 项目记得 --all
run: |
  cargo cyclonedx --format json --all
  mkdir -p sbom && find . -maxdepth 3 -name '*.cdx.json' -exec cp {} sbom/ \;
```

### 2. assets glob `**/*.cdx.json` 上传后路径错位

```
Error: pattern doesn't match
```

或 download 后 artifact 嵌套两层目录。
**原因**：`upload-artifact@v4` 把 glob 当字面量目录树保留，下游 `download-artifact` 不展平。
**修法**：上传前先 `mkdir sbom && cp` 到扁平目录，下载用 `merge-multiple: true` 合并所有 artifact 到一个目录。

### 3. macos-13 free-tier queue throttle

x86_64-apple-darwin target 在 GitHub-hosted macos-13 runner 上排队 >12 分钟才开始，free-tier 账号尤甚。
**修法选项**：

- 短期：从 matrix 里删掉 x86_64-apple-darwin，README 给「Intel Mac 用户 cargo install --git 自建」指引
- 长期：升级 paid plan，或接 self-hosted Intel Mac runner
- 备选：用 `cross` + `osxcross` 在 ubuntu 上交叉编译（不推荐，工具链不稳）

### 4. Dockerfile 缺 `COPY assets`

```
error: couldn't read `assets/admin-console.html`: No such file or directory
```

**原因**：Rust `include_str!()` / `include_bytes!()` 在编译期读文件，但 Dockerfile 只 `COPY src config` 没把 `assets/` 拉进 builder 层。
**修法**：

```dockerfile
COPY src ./src
COPY config ./config
COPY assets ./assets        # ← 编译期资源全部 COPY 进去
COPY Cargo.toml Cargo.lock ./
RUN cargo build --release --locked
```

**通用规则**：任何 `include_str!` / `include_bytes!` / `build.rs` 读到的路径都要在 Dockerfile builder 阶段可见。

### 5. cargo-deny `multiple-versions = warn` 拦 CI

```
error[duplicate]: found 2 duplicate entries for crate 'winnow'
```

**原因**：`cargo-deny-action` 把 `warn` 也当 gate-failing；axum/reqwest/hyper/tokio 生态自然会拉双版本小工具 crate（winnow / hashbrown / getrandom）。
**判断**：这是生态自然 churn 不是产品质量问题，独立项目无法消除（除非 fork upstream）。
**修法**：

```toml
# deny.toml
[bans]
multiple-versions = "allow"   # 让出来；改用 cargo tree --duplicates 本地审计
wildcards = "deny"            # wildcards 仍然严禁
deny = []                     # 单点 deny 列表保留入口
```

### 6. cargo-deny license `license-not-encountered`

```
error[license-not-encountered]: license 'MPL-2.0' was not encountered
```

**原因**：strict 模式下 `allow = [...]` 里列了但依赖图里没用到的 license，会被当成「过期允许」失败。
**修法**：

- 只 allow 实际遇到的 license
- 新增依赖触发新 license（如 `webpki-roots` 升级到 CDLA-Permissive-2.0）时，先在 PR 评估 license 兼容，再加到 allow

### 7. cosign keyless 验证报 identity mismatch

```
no matching signatures: certificate identity does not match
```

**原因**：keyless 签名把 GitHub workflow 路径写进 cert，验证方必须 `--certificate-identity` 写对完整路径。
**修法**：

```bash
# 用 regexp 容错（branch / tag 都能过）
cosign verify "${IMG}@${DIGEST}" \
  --certificate-identity-regexp 'https://github.com/org/repo/.github/workflows/release\.yml@.*' \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com'
```

### 8. cosign sign 跑两次卡 rekor 速率

罕见，但当一次 release 给 5+ tag 都 sign + attest 时（v1.2.3 / 1.2 / 1 / latest），rekor 公共 instance 可能限流。
**修法**：把 sign + attest 都放在同一 cosign-installer step 内顺序执行，不并发；或上 self-hosted rekor。

## release pipeline 红线

| 红线 | 何时该警 |
|------|---------|
| 没有 `permissions:` 顶层声明 | 默认 GITHUB_TOKEN 写权限过宽 |
| `id-token: write` 缺 → cosign keyless 跑不起来 | 第一个 cosign sign step 立刻失败 |
| `outputs.digest` 不传给签名 job | 签 floating tag 而非 digest，等于没签 |
| sign 用 `tag` 而非 `tag@digest` | 同上 |
| 漏 `permissions: attestations: write` | provenance 推不上 registry |
| 没有 SBOM artifact 上传 | sign-image 拿不到 SBOM 跳过 attest，链路缺一环 |
| 用 macos-latest 而不固定 macos-14 | runner image 切换静默改行为 |
| third-party action 不 pin SHA | 详见 [supply-chain.md `action pin hash`](../securing-cloud-and-supply-chain/references/supply-chain.md) |

## 与其他 skill 联动

- 安全机制（SLSA / Sigstore / SBOM 概念）→ [supply-chain](../securing-cloud-and-supply-chain/references/supply-chain.md)
- 容器/K8s 准入策略 → [container-and-k8s](../securing-cloud-and-supply-chain/references/container-and-k8s.md)
- 镜像扫描 / DAST / SAST 工具链 → [devsecops](devsecops.md)
- 测试策略（pre-release smoke / canary） → [testing](testing.md)
- 部署方式（GitOps / Argo Rollouts） → `provisioning-infrastructure`
