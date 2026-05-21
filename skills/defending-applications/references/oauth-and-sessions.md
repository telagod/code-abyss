# OAuth / OIDC / Session 安全

> 认证看 token，授权看 scope，会话看绑定。三个都做对才叫"已登录"。

## OAuth 2.0 流程选型

| 流程 | 用途 | 是否需要 PKCE |
|------|------|---------------|
| Authorization Code | Web 后端、SPA、Mobile | ✅ 强制 |
| Client Credentials | 服务到服务 | — |
| Device Code | TV、CLI | — |
| Implicit | **已弃用** | — |
| Resource Owner Password | **已弃用** | — |

**SPA / Mobile 一律 Authorization Code + PKCE，不要再用 Implicit。**

## PKCE

```javascript
// 客户端生成
const verifier = base64urlencode(crypto.randomBytes(32));
const challenge = base64urlencode(sha256(verifier));

// /authorize 携带
?code_challenge=<challenge>&code_challenge_method=S256

// /token 交换时携带原始 verifier
&code_verifier=<verifier>
```

服务端必须校验 `S256(verifier) == stored_challenge`。**plain method 一律拒绝**。

## redirect_uri 校验（最常见误配）

```python
# ❌ 通配 / 前缀匹配 / startswith
if redirect_uri.startswith("https://example.com"):  # 攻击者用 https://example.com.evil.com

# ❌ 信任 host 部分
if urlparse(redirect_uri).netloc == "example.com":  # path/query 仍可注入

# ✅ 全量精确匹配
ALLOWED_REDIRECT_URIS = {
    "https://app.example.com/auth/callback",
    "https://example.com/callback",
}
if redirect_uri not in ALLOWED_REDIRECT_URIS:
    raise HTTPException(400)
```

## state / nonce / CSRF

```python
# ❌ 不带 state
auth_url = f"{IDP}/authorize?client_id=...&redirect_uri=...&response_type=code"

# ✅ state CSRF 保护 + nonce 反重放
state = secrets.token_urlsafe(32)
nonce = secrets.token_urlsafe(32)
session["oauth_state"] = state
session["oauth_nonce"] = nonce
auth_url = f"{IDP}/authorize?...&state={state}&nonce={nonce}"

# 回调
@app.get("/auth/callback")
def callback(code: str, state: str):
    if not secrets.compare_digest(state, session.pop("oauth_state", "")):
        raise HTTPException(400, "state mismatch")
    # 交换 code，校验 id_token.nonce == session.oauth_nonce
```

## scope 升权（Confused Deputy）

```
GET /authorize?scope=read              ← 用户授予 read
... 拿到 code ...
POST /token  code=...&scope=admin       ← 攻击者尝试升权
```

服务端必须忽略 `/token` 的 scope，只用 `/authorize` 时用户授权的范围。或要求 `/token` scope ⊆ 原 scope。

## OIDC id_token 校验

```python
# ❌ 信任 JWT 不校验
payload = jwt.decode(id_token, options={"verify_signature": False})

# ✅ 校验全套
payload = jwt.decode(
    id_token,
    key=get_jwks_key(kid),   # 从 IdP /.well-known/jwks.json 拉
    algorithms=["RS256"],     # 显式指定，禁 'none' 和 HS*
    audience=CLIENT_ID,       # aud
    issuer=ISSUER,            # iss
)
# 额外校验
assert payload["nonce"] == session["oauth_nonce"]
assert payload["exp"] > time.time()
assert payload.get("iat", 0) < time.time() + 60  # 防未来时间
```

**JWKS kid 缓存**：必须有缓存 + 缓存失效（IdP 轮换密钥时）。Backoff 重试拉 JWKS。

## JWT 经典攻击

### alg=none

```http
{"alg": "none", "typ": "JWT"}.{...}.   ← 签名为空
```

修：库层显式 `algorithms=["RS256"]`（白名单），不要传 `algorithms=jwt.algorithms.get_default_algorithms()`。

### kid 注入

```http
{"alg": "RS256", "kid": "../../etc/passwd"}
{"alg": "HS256", "kid": "'; DROP TABLE keys; --"}
```

修：kid 校验白名单（来自 JWKS 已知集合）；查找 key 时不要走文件路径或 DB 拼接。

### alg confusion (RS256 → HS256)

攻击者用公钥作 HMAC secret。修：根据 alg 加载不同类型的 key，严格类型检查（`isinstance(key, RSAPublicKey)`）。

### jku / jwks_url 注入

某些库允许 JWT 头声明 `jku` 指向自己控制的 JWKS。修：禁用 jku 头处理，或白名单 URL。

## Refresh Token

```python
# ✅ Rotation + 检测重用
@app.post("/token")
def refresh(refresh_token: str):
    stored = db.fetch_one("SELECT * FROM refresh_tokens WHERE token_hash = :h",
                         {"h": hash(refresh_token)})
    if not stored: raise HTTPException(401)
    if stored.used:
        # 重用 = 被盗，撤销整个 family
        db.execute("UPDATE refresh_tokens SET revoked = true WHERE family_id = :f",
                   {"f": stored.family_id})
        raise HTTPException(401, "token reuse detected")
    db.execute("UPDATE refresh_tokens SET used = true WHERE id = :id", {"id": stored.id})
    new_rt = secrets.token_urlsafe(64)
    db.execute("INSERT INTO refresh_tokens (token_hash, family_id, ...) VALUES (...)",
               {"family_id": stored.family_id})
    return {"access_token": ..., "refresh_token": new_rt}
```

存储 hash 不存明文，与密码同理。

## Session 管理

```python
# ❌ 登录后 session id 不变
session["user_id"] = user.id
return RedirectResponse("/home")

# ✅ 登录后 rotate session
old_session_data = dict(session)
session.regenerate_id()   # 新 ID
session.update(old_session_data)
session["user_id"] = user.id
```

**Session Fixation**：攻击者预设 session_id，诱导受害登录后接管。Rotate 是唯一防御。

## Cookie 安全标志

```http
Set-Cookie: sid=abc123;
  HttpOnly;          ← 禁 JS 读
  Secure;            ← 仅 HTTPS
  SameSite=Lax;      ← CSRF 防御
  Path=/;
  Domain=example.com;  ← 不要写 .example.com（共享给子域风险）
  Max-Age=3600;
```

**`__Host-` 前缀**最安全：浏览器强制 `Secure` + `Path=/` + 无 `Domain`：

```http
Set-Cookie: __Host-sid=abc123; Secure; HttpOnly; Path=/; SameSite=Strict
```

**`SameSite`** 选择：
- `Strict`：最严，跨站请求一律不带（含点击外链）
- `Lax`：跨站 GET 顶层导航带（默认推荐）
- `None`：必须 `Secure`，跨站第三方场景才用（嵌入式 widget）

## SAML XSW (XML Signature Wrapping)

```xml
<!-- 攻击：把签名块和断言块错位 -->
<Response>
  <Signature> <!-- 签名旧的合法 Assertion --> </Signature>
  <Assertion id="evil">
    <!-- 攻击者控制内容，引用 id 错位 -->
  </Assertion>
</Response>
```

修：用经过验证的 SAML 库（python-saml / OneLogin / Spring Security SAML）。**自写 XML 签名校验几乎一定有漏洞**。

## SSO 退出（注销）

```python
@app.post("/logout")
def logout():
    session.clear()          # 本地清
    return RedirectResponse(f"{IDP}/logout?id_token_hint={id_token}&post_logout_redirect_uri=...")
```

OIDC Front-Channel / Back-Channel Logout：IdP 通知所有 RP 注销。如多个 SP 共享 IdP，必须实现，否则单点登出失效。

## 检测信号

| 信号 | 含义 | 阈值 |
|------|------|------|
| `oauth_state_mismatch_total` | CSRF 攻击或会话过期 | 任何持续上升 |
| `jwt_invalid_signature_total` | 攻击或 key 轮换故障 | >0 / 5min |
| `refresh_token_reuse_detected` | 凭证被盗 | =1 立即告警 |
| `concurrent_session_count{user_id}` | 同账号多地登录 | 取业务上下文阈值 |
| `password_grant_total` | 仍有人用 ROPC | 应为 0 |
| `auth_alg_none_total` | alg=none 尝试 | =1 立即告警 |
