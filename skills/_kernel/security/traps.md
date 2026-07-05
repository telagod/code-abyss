# Traps — security theater and how real security dies

Security rot is the same disease as all rot (`backend/rot.md`, `ml/traps.md`): the
death of feedback. Here the feedback organ is **testing your own defenses** — when
nobody ever checks whether a control actually stops the attack it's for, the controls
drift into ritual. Each trap: signal → why → fix.

## A · Theater — controls that perform security instead of providing it

1. **Security by obscurity as the plan.** Hidden admin URL, hardcoded "secret" ports,
   client-side-only validation, "nobody knows our internal API shape". *Why:* obscurity
   is a speed bump, not a control — one leaked link/decompile and it's gone. *Fix:*
   obscurity only ever on top of real authz (`design.md` §4), never instead of it.
2. **The moat mindset.** Hard perimeter, soft inside: everything internal trusts
   everything internal. *Why:* one phished laptop = total compromise; this is the
   architecture behind most mega-breaches. *Fix:* assume breach (`scope.md` §3),
   authenticate service-to-service, segment.
3. **Compliance as the finish line.** "We're SOC2/ISO certified" answering "are we
   secure?". *Why:* audits verify documented process exists, not that attacks fail —
   Target was certified PCI-DSS compliant ten weeks before its 2013 breach (stolen
   third-party HVAC-vendor credentials pivoted into an unsegmented POS network for
   ~40M card numbers) — plenty of certified companies are breached through gaps the
   checklist never covers. *Fix:* compliance is a floor and a sales artifact; the
   threat model (`threat-model.md`) is the security plan.
4. **The appliance that absolves.** "We have a WAF/EDR/next-gen-firewall, so the code
   can be sloppy." *Why:* every generic filter has bypasses catalogued publicly; it's
   one layer (`design.md` §1), and the vendor's marketing is not your threat model —
   worse, the appliance is itself a workload with standing privilege: Capital One's
   2019 breach ran through an overpermissioned WAF whose SSRF flaw reached the
   metadata endpoint (169.254.169.254) for its host's IAM credentials, 106M records
   exfiltrated, no bypass required. *Fix:* fix the injection; keep the WAF as depth —
   and give the appliance itself least-privilege, SSRF-hardened config, not blanket
   trust.
5. **Password rituals over password reality.** Forced 90-day rotation + complexity
   rules, producing `Summer2026!` → `Autumn2026!`. *Why:* rituals optimize for audit
   checkboxes; users route around them predictably. *Fix:* length + no-reuse +
   breach-list screening + MFA (`operate.md` §1) — the controls with evidence.
6. **The unread scanner.** SAST/dependency/cloud-posture scanners run on every build;
   4,000 open findings; nobody dispositions them. *Why:* an alert stream nobody triages
   is indistinguishable from no scanner — worse, it manufactures false confidence.
   *Fix:* every alert gets dispositioned (fix / accept-with-owner / tune the rule);
   if you won't staff that, run fewer, higher-signal checks.

## B · Process rot — how a real program decays

7. **Security as the gate at the end.** Review happens the week before launch; findings
   arrive when redesign is impossible; everything ships "with exceptions". *Fix:* threat
   model at design time (`threat-model.md`) — the whole point of `design.md` is that
   early security is nearly free.
8. **The exception that never expires.** "Temporary" firewall hole, "just for the demo"
   public bucket, a risk "accepted" by someone who left. *Why:* accepted risks without
   owner + expiry are permanent unowned holes. *Fix:* every exception has an owner and
   an expiry date that triggers re-review — no expiry, no exception.
9. **Alert fatigue.** Hundreds of security alerts/day, so on-call auto-closes them —
   including, one day, the real one: Neiman Marcus's 2013 breach fired ~60,000
   endpoint-protection alerts over 3.5 months, under 1% of the team's routine daily
   log volume, malware named to blend into legitimate payment software — 350K cards
   exposed before anyone looked. *Fix:* an alert that isn't actionable gets tuned or
   deleted; volume is the enemy of detection (same reflex as `ml/traps.md` §13's
   alert-on-shift discipline — a signal nobody can act on is noise wearing an alarm).
10. **The untested defense.** Backups never restored, IR plan never drilled, the
    "isolated" network never probed, log pipeline silently broken for months. *Why:*
    this is THE meta-trap — an untested control is a belief, and attackers specialize
    in beliefs. *Fix:* `operate.md` §5 drills; verify controls the way `methods/verify.md`
    verifies anything: by exercising them, not by reading their config.
11. **Blame as the incident response.** Postmortem hunts for who clicked the link.
    *Why:* humans will always click; blame just guarantees the next incident is hidden
    from you until it's huge. *Fix:* blameless postmortems that fix the *system* (why
    did one click grant that much? — `design.md` §2).
12. **Security vs. everyone.** Controls so hostile that engineers build workarounds —
    shared accounts because provisioning takes weeks, secrets in chat because the vault
    is painful. *Why:* the workaround is now the real (unaudited) system. *Fix:*
    `scope.md` §4 — a bypassed control is worse than none; make the paved road the easy
    road.

## C · Supply chain — someone else's code with your privileges

13. **`npm install` as an act of faith.** Deps added for one function, each with
    transitive deps and install scripts nobody read. *Why:* a compromised or
    typosquatted package runs with your app's privileges on install; this is now a
    routine attack — two current shapes, both real: the xz-utils backdoor
    (CVE-2024-3094) was a maintainer identity cultivated over ~2 years, its RCE
    hidden in release tarballs only (not the visible git source), caught by chance
    via SSH logins running 500ms instead of 100ms; the Shai-Hulud npm worm (Sept
    2025) needed no cultivated trust at all — compromised maintainer accounts'
    postinstall scripts harvested tokens and auto-published trojaned versions of
    every other package those tokens could reach, self-propagating across hundreds
    of packages within days. *Fix:* `design.md` §6 fewer deps + `operate.md` §4
    pinning and audit.
14. **Floating tags in the build.** `image:latest`, CI action `@v3`, unpinned
    transitive deps. *Why:* your build re-resolves the world each run; whoever
    compromises the upstream tag compromises you silently — the tj-actions/
    changed-files compromise (CVE-2025-30066, Mar 2025) did exactly this: a stolen
    maintainer PAT rewrote the action's *existing* tags to point at a malicious
    commit, so every consumer pinned by tag (`@v45`) silently ran code dumping CI
    runner memory and secrets into public logs across thousands of repos; pinning
    by commit SHA would have been immune. *Fix:* pin by digest/hash; updates arrive
    as reviewable diffs, not surprises.
15. **The CI that owns everything.** Build system holding god-credentials, forks able to
    run workflows with secrets, deploy keys valid forever. *Why:* attackers go where the
    secrets pool; CI is the softest crown jewel in most orgs. *Fix:* `operate.md` §4 —
    least-privilege pipeline tokens, secrets scoped per-job, branch protection.
16. **Trusting the resolver.** An internal package (`@acme/auth-utils`) lives only
    on a private registry; nobody has claimed that name on the public one. *Why:*
    a resolver configured to check multiple registries picks by "highest version
    wins" — Birsan's 2021 research showed publishing the same name publicly with
    an inflated version (`9000.0.0`) makes builds silently fetch and run the
    attacker's package with CI/build privileges; internal names routinely leak via
    `package.json` bundled into shipped JS. Compromised 35+ companies — Apple,
    Microsoft, PayPal — on first disclosure, no phishing or typo required. *Fix:*
    claim your org's scope/namespace on every public registry you use, even
    unused; configure private-registry-first resolution with no public fallback
    for internal names; pin registries per-package.
17. **The `<script src>` you don't control.** Third-party JS/CSS pulled straight
    from someone else's origin — no lockfile, no CI, no package manager in the
    loop. *Why:* the polyfill.io compromise (Feb–Jun 2024) changed domain
    ownership and started injecting malware and mobile redirects across 100,000+
    sites that hadn't touched a line of their own code — the same failure shape as
    a floating tag, just outside the dependency tooling entirely. *Fix:* self-host
    third-party scripts or pin with Subresource Integrity (SRI) so the browser
    refuses altered bytes; scope allowed script origins with CSP.

## The meta-signal

One question sums a security program's health: **"when did you last see one of your
defenses actually stop or catch something — and would you know if it silently
stopped working?"** Every trap above is a way the answer becomes "we don't know."
Theater looks identical to security until the day it's tested by someone who isn't you.
