# Threat modeling — decide what you're defending before how

Security without a threat model is buying locks at random. The model answers: what are
we protecting, from whom, and which risks are worth spending on. Do it on a whiteboard
before you touch a control.

## 1 · The four questions (the whole method)

1. **What are we working on?** Produce the diagram **as text** — a bullet list or
   mermaid block naming (a) each component and data store, (b) each data flow as
   `source → dest: what data`, (c) each trust boundary marked inline (e.g.
   `[BOUNDARY: internet→api]`). This artifact is the deliverable of Q1; §3's boundary
   markers and `review.md` §1's entry-point list are read straight off it. You cannot
   secure what you haven't drawn.
2. **What can go wrong?** Walk the diagram enumerating threats (STRIDE is a useful
   prompt: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service,
   Elevation of privilege — one pass per element). STRIDE has no slot for privacy harm
   to the data *subject* (re-identifying someone by joining two separately-anonymized
   flows, silent secondary use of data they never consented to) — for anything tagged
   regulated/confidential under §4, run LINDDUN as a second pass over the same diagram
   (Linking, Identifying, Non-repudiation, Detecting, Disclosure, Unawareness,
   Non-compliance): same four-question backbone, an added lens, not a replacement.
3. **What are we going to do about it?** Per threat: **mitigate** (add a control),
   **accept** (with a named owner and an expiry — `traps.md` §B8), **transfer** (make it
   contractually someone else's: insurance, a payment processor holding the card data, a
   managed auth provider), or **eliminate** (remove the feature/data so the threat has
   no target — often the cheapest, see §4 minimization). Not everything gets fixed —
   that's the point of ranking.
4. **Did we do a good job?** Revisit when the system or the threats change.

## 2 · Name the adversary — capability sets the whole design

"Secure" is meaningless without "against whom". Different adversaries justify different
spend:

- **Opportunistic/automated** (bots, scanners, credential stuffing) — the baseline
  everyone faces; defeated by hygiene (patching, MFA, rate limits).
- **Motivated individual** (a targeting attacker, a malicious user of your own product) —
  needs real authz, input handling, monitoring.
- **Insider** (employee, contractor, a compromised internal account) — least privilege,
  audit logs, separation of duties; the assume-breach case (`scope.md` §3).
- **Resourced/organized** (crime groups, APTs) — defense in depth, detection, and IR;
  you plan to detect and respond, not just prevent.

State which tiers you're defending against; designing against nation-states for a
hobby blog wastes the budget the real threats needed.

## 3 · Trust boundaries are where security lives

A trust boundary is any line where data or control crosses between differently-trusted
zones: internet→server, service→service, user→kernel, your code→a third-party API, one
tenant→another. **Every input crossing a boundary is validated; every action crossing
one is authorized.** Most vulnerabilities are a boundary that someone assumed was
internal-and-safe. Mark them on the diagram — they are your review checklist
(`review.md`) and your defense-in-depth layer lines (`design.md` §1).

## 4 · Classify data; let it drive controls

Not all data deserves equal protection. Tag stores and flows by sensitivity (public /
internal / confidential / regulated — PII, secrets, payment, health). The classification
drives the controls directly:

- **Regulated / secrets** → encrypted at rest via a KMS, access logged (`operate.md` §3),
  a retention limit with a date, never in logs.
- **Confidential** (PII, internal financials) → per-object authz, no export without
  logging.
- **Internal** → authenticated access only.
- **Public** → integrity only (can't be tampered), no confidentiality spend.

You cannot lose what you didn't collect, so the first control on high-sensitivity data
is *not collecting or not keeping it* (data minimization). A crown-jewel inventory
("what would be catastrophic to lose?") focuses everything downstream. For each named
jewel, add an attack tree: root is the adversary's goal, OR-node children are the
distinct paths to it, decomposed until each leaf is one concrete step (Schneier, "Attack
Trees," 1999) — depth-first on the one or two assets that matter most, where STRIDE's
per-element walk in Q2 is breadth-first across the whole diagram.

## 5 · Rank by risk, not by novelty or fear

Risk ≈ impact × likelihood. Spend on the high-impact, plausible-likelihood cell first —
the boring authz bug on the payment endpoint outranks the exotic side-channel that needs
lab conditions. Attackers take the cheapest path in; a $10 lock on a door next to an open
window is the most common real-world failure. Fix the window.
