# Secure design — build it right so review finds little

Security designed in is cheap; security bolted on is a permanent tax. These principles
are old because they work — apply them at design time, when they cost nothing.

## 1 · Defense in depth — no single control is trusted

Assume every layer can fail and put another behind it: WAF AND input validation AND
parameterized queries AND least-privilege DB user. When one control is bypassed (and one
will be), the next limits the damage. A design with exactly one thing standing between
the attacker and the crown jewels is one bug from catastrophe.

## 2 · Least privilege — everything gets the minimum

Every user, service, token, and process runs with the least access that lets it do its
job, and no more. The app's DB user cannot `DROP`; the image-resizer can't read the user
table; the API token scopes to one action; the container drops every capability it
doesn't use. When breach happens (`scope.md` §3), least privilege is what caps the blast
radius from "everything" to "one thing".

## 3 · Fail closed, and make secure the default/only path

- **Fail closed:** when a security check errors, deny — an auth service timeout must
  reject, never fall through to "allow". `try { authorize() } catch { return ALLOW }` is
  the shape of a breach.
- **Secure by default:** the safe configuration is the one you get by doing nothing —
  private buckets, deny-all firewalls, MFA on, TLS required. Security you have to
  remember to turn on is off in most deployments.
- **Make the safe way the easy way:** a helper that's automatically safe (an ORM /
  query builder that always parameterizes, a template engine that auto-escapes) beats a
  rule telling tired humans to be careful. Paved roads beat warning signs
  (`backend/logic.md` §3, make-illegal-states-unrepresentable).

## 4 · AuthN and AuthZ are different, and authz is per-object

- **Authentication** (who are you) ≠ **authorization** (what may you do). Getting the
  first right does nothing for the second.
- **Default new user-facing authN to WebAuthn/FIDO2 passkeys**, not password+OTP bolted
  on after the fact: a passkey binds a keypair to the origin that created it, so there's
  no shared secret for a phishing page to capture, and NIST SP 800-63-4 now recognizes a
  properly-implemented syncable passkey as meeting AAL2. Password support still has a
  place (recovery, unsupported clients) but shouldn't be the default path anymore
  (`operate.md` §1 makes the same call for infrastructure accounts — apply it at design
  time for product logins too).
- **Check authorization on every request, against the specific object.** `/orders/123`
  must verify order 123 belongs to the caller — the single most common serious real-world
  hole is object-level authz that checks "logged in?" but not "yours?" (IDOR;
  `backend/operate.md` §5, `review.md` §2). This extends to the *bytes behind a
  reference*: a token or capability that unlocks a resource must also gate the file/blob
  it points to (signed short-lived URL or ownership re-check at fetch), or the IDOR
  simply reappears at the storage layer (`review.md` §5).
- **Sessions/tokens:** short-lived, revocable, scoped, sent only over TLS. Deny by
  default; grant explicitly. Delegated auth via OAuth: use OAuth 2.1 defaults — no
  implicit grant, PKCE on the authorization-code flow for every client type, and
  sender-constrained tokens (DPoP or mTLS) so a stolen bearer token alone isn't enough
  to use it.

## 5 · Cryptography — use it, never invent it

- **Never design your own** cipher, hash construction, or protocol — this is a trap for
  experts, not just a rule for beginners. Use vetted, boring libraries (libsodium/NaCl,
  the platform's TLS, a real KMS).
- **Right primitive for the job:** passwords → **argon2id** preferred (floor: m≥19MiB,
  t=2, p=1), bcrypt/scrypt as fallback (slow, salted — never a fast/raw hash); PBKDF2
  needs ≥600,000 HMAC-SHA256 iterations today, not a stale four-digit default. Screen
  new passwords against breached-password lists; NIST SP 800-63B-4 (2025) drops
  mandatory complexity rules and forced periodic rotation absent evidence of compromise
  — flagging their *absence* as a gap is itself now the outdated take. Data in transit →
  TLS 1.2+; data at rest → AES-GCM with a **unique nonce per encryption** (never reuse a
  (key, nonce) pair — it leaks plaintext and the auth key, a silent catastrophic break
  found live on production HTTPS servers, Böck et al., USENIX WOOT 2016); in practice use
  envelope encryption via a KMS (fresh data key per object) or a misuse-resistant
  construction (AES-GCM-SIV, XChaCha20-Poly1305) rather than managing GCM nonces by hand.
  Never ECB — its deterministic output is how Adobe's 2013 breach (~150M records touched,
  ~38M active users) let attackers correlate encrypted passwords via hint-matching.
  Integrity → HMAC or AEAD; randomness → the crypto RNG, never `rand()`.
- **Harvest-now-decrypt-later:** for data/traffic that must stay confidential for years
  (multi-year backups, health/legal records, fielded embedded devices) prefer hybrid key
  exchange (classical + ML-KEM/FIPS 203) where the stack supports it — already default in
  current TLS 1.3 deployments from major browsers/CDNs and OpenSSH. NIST's timeline (IR
  8547, initial public draft): RSA/ECC deprecated after 2030, disallowed after 2035 —
  track it now for anything with a multi-year cert or protocol lifetime; ordinary
  short-lived TLS sessions aren't urgent.
- **Secrets aren't crypto config:** keys/tokens/passwords live in a secret manager, never
  in code, git, logs, or images; rotate them; scope them. Key management is where most
  crypto actually fails, not the algorithm.

## 6 · Minimize the attack surface

Every endpoint, port, parameter, dependency, and feature flag is attack surface. The
most secure component is the one that isn't there: fewer dependencies (each is someone
else's code with your privileges — `traps.md` §C), fewer exposed services, less retained
data (`threat-model.md` §4), disabled unused features. Complexity is the enemy of
security because you cannot secure what you cannot fully reason about.
