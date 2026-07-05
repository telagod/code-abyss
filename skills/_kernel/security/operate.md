# Operating securely — hardening, secrets, detection, response

Design (`design.md`) decides what's possible; operations decides what actually happens
at 3am. The through-line: **prevention will fail eventually — detection and response
are what make that survivable** (`scope.md` §3).

## 1 · Hardening — the baseline nobody gets to skip

- **Patching is the control with the best ROI.** Most real compromises use known,
  patched-months-ago vulnerabilities, not zero-days — exploiting known vulns overtook
  stolen credentials as the #1 initial-access vector in the 2026 DBIR (31% of breaches,
  a first in 19 years of the report), while KEV-list remediation coverage fell to 26%
  (from 38%). Have a cadence: anything on CISA's KEV list → a defined short window
  (days), not folded into the monthly pass; the rest → a scheduled monthly pass. "We'll
  patch when we have time" means never.
- **Kill defaults:** default credentials, sample apps, directory listings, debug
  endpoints/`DEBUG=true`, admin panels on the public interface, unused services and
  open ports. Scanners find these within hours of exposure — this is the opportunistic
  tier (`threat-model.md` §2) and hygiene fully defeats it.
- **MFA on everything that administers anything** — the cloud console, the VCS, the
  registry, the CI. Stolen or reused credentials are consistently a top initial-access
  vector; MFA is the single highest-value control against them (prefer
  phishing-resistant MFA — FIDO2/passkeys — since OTP/push is routinely bypassed by
  real-time adversary-in-the-middle phishing kits (Evilginx-style): they relay the login
  and the OTP/push approval to the real site, let the challenge succeed legitimately,
  then steal and replay the session cookie issued afterward — the code was never wrong.
  FIDO2 resists this because the authenticator's signature is cryptographically bound to
  the requesting origin, so a phishing domain can't obtain a valid one to relay).
- **Config is code:** security-relevant config (IAM, firewall rules, bucket policies)
  lives in versioned IaC, reviewed like code — a hand-edited console is how "temporarily
  public" buckets become permanent.

## 2 · Secrets — a lifecycle, not a variable

- **One home:** a secret manager (Vault, cloud KMS/SSM, at minimum encrypted CI
  secrets). Never in code, git, images, `.env` committed "just for dev", build logs, or
  chat — and "images" means every layer: an `ARG`/`ENV` secret or a file added then
  deleted in a later layer is still recoverable from layer history even though the
  final image looks clean, so use BuildKit secret mounts (`--mount=type=secret`) for
  build-time credentials, not `ARG`/`ENV`. Git history counts: a key that ever touched a
  commit is compromised — **rotate it**, don't just delete the line.
- **Scope and expiry:** per-service credentials, least privilege (`design.md` §2),
  short-lived where the platform supports it. One shared god-token means one leak = 
  total compromise and no way to know who used it.
- **Rotation must be boring:** if rotating a credential is a scary manual event, it
  won't happen during the incident when you need it in minutes. Automate or drill it.
- **Scan continuously:** secret scanning on push — catching the leak at commit time is
  ~free; catching it in an incident is not. gitleaks is now maintenance-mode (security
  patches only, no new features); Betterleaks is its actively-developed successor.
  GitHub push protection — the control that actually blocks the push — is off by
  default for private/internal repos (only auto-on for new personal public repos) and
  needs GitHub Advanced Security enabled explicitly; verify it's on, don't assume "we
  use GitHub so we're covered."
- **Agent/MCP config files are a secrets surface too:** a recent industry scan found
  tens of thousands of exposed secrets in public MCP config files — full treatment in
  `agentic.md`.

## 3 · Detection — you can't respond to what you can't see

Security logging is its own requirement beyond debugging logs (`backend/operate.md`):

- **Log security events:** authn successes AND failures, authz denials, privilege/role
  changes, password/MFA resets, admin actions, secret access, data exports. With actor,
  object, source IP, timestamp — and never the credential itself (`review.md` §4).
- **Alert on attacker signals:** login-failure bursts (stuffing), authz-denial bursts
  from one account (IDOR probing), impossible travel, first-time-privileged actions,
  outbound traffic from boxes that should have none — and, since a replayed stolen
  session skips login entirely, the same session ID or token used from two conflicting
  IPs/devices/geolocations with no fresh interactive auth between them.
- **Logs must survive the attacker:** ship them off-host to somewhere the compromised
  machine can't erase; attackers delete local logs first. Global median dwell is now
  ~2 weeks (14 days per Mandiant M-Trends 2026 — up from 11 in 2024, the multi-year
  decline reversing), but espionage/insider intrusions run a median 122 days, and
  access-to-handoff (initial compromise to resale to a second-stage attacker, e.g. a
  ransomware crew) has collapsed to a median ~22 seconds — the reason severity levels,
  incident-commander authority, and comms channels (§5) have to be decided before an
  incident, not during one. Retain 12+ months, not a vague "months."

## 4 · Dependencies and supply chain — someone else's code, your privileges

- **Pin everything:** lockfiles committed; container base images by digest; CI actions
  by hash, not floating tags. An unpinned dependency is an open invitation for whoever
  compromises the registry next (`traps.md` §C).
- **Audit continuously, triage honestly:** automated CVE scanning (Dependabot/renovate +
  `npm audit`/`pip-audit`/`cargo audit`) wired to a human who actually dispositions each
  alert — an ignored scanner is theater (`traps.md` §A6). CVE scanning only catches
  known-bad versions of legitimate code, not a just-published malicious package or an
  intentionally backdoored release — neither has a CVE yet (the xz-utils backdoor,
  CVE-2024-3094, was caught by an engineer noticing SSH login latency, not a scanner; the
  2025 Shai-Hulud npm worm's trojaned versions were hours old when auto-installed). Pair
  vuln scanning with a malicious-package feed (OSV) and install-script/postinstall-
  network-egress review, plus a short delay before auto-upgrading to a just-published
  version instead of always-latest.
- **Fewer deps, vetted deps:** before adding one — maintained? popular enough to be
  watched? does 30 lines of your own code do it? (`design.md` §6).
- **Protect the pipeline itself:** the CI system can push code and read every secret —
  it's a crown jewel (`threat-model.md` §4). Least-privilege its tokens; branch
  protection on what ships.

## 5 · Incident response — prepared is the whole game

An IR plan invented during the incident is panic with a template. Decide **before**:

- **Who decides** (severity levels, an incident commander, who may take prod down or
  force-rotate everything), **how you communicate** when normal channels may be
  compromised, and **what you'd look at first** (where the logs are — §3).
- **The loop:** contain (isolate hosts; revoke credentials — treat as two steps: reset
  the password/secret AND separately invalidate any active sessions, refresh tokens, or
  API keys tied to the account, since a stolen session survives a password change until
  explicitly killed; block egress) → eradicate (find and close the entry, rotate every
  touched secret, and check for and revoke/remove attacker-planted persistence — newly
  registered MFA devices, mailbox-forwarding rules, added OAuth app consents — planted
  right after session theft to survive rotation) → recover (restore from known-good,
  watch for re-entry) → **learn** (blameless postmortem: which control was
  missing/failed, fix that class — feed it back into `threat-model.md` §1 Q4).
- **Preserve evidence while containing:** snapshot before wiping; you'll need to know
  what they touched to know what to rotate and whom to notify.
- **Backups are a security control:** offline/immutable copies (ransomware encrypts
  reachable backups first), and **a backup you haven't test-restored is a hope, not a
  backup** — drill the restore, time it.
- **Drill it once:** a tabletop exercise ("laptop with prod keys stolen — go") finds
  the broken assumptions for the price of an afternoon meeting.
