---
user-invocable: false
name: security
description: Defensive security engineering judgment, distilled from a stronger model - invoke when THREAT MODELING a system or feature; making security-relevant design decisions (auth, crypto, trust boundaries, attack surface); reviewing code for vulnerabilities (injection, IDOR, secrets, the OWASP classes); hardening operations (secrets management, detection, patching, incident response); or judging whether a security control/program is real or theater. Also invoke BEFORE any offensive-flavored request (pentest, exploit, credential testing) to apply the authorization gate. Also invoke when designing, reviewing, or hardening an LLM/agent system that reads untrusted content or holds tool/MCP access (prompt injection, excessive agency, MCP supply chain).
---

# Security — scope gate, threat model, design, review, operations, traps, agentic AI

Rule content lives in the seven files below; this SKILL.md only routes
(`doctrine/04-maintenance.md` governs edits to this bundle too).

**First, always:** `scope.md` §1 — the authorization gate. It fires on ANY request
mentioning exploits, payloads, bypassing auth/WAF/filters, cracking, brute force,
credential/password testing, scanning a target, or accessing a system the requester
didn't build in this session — recognize the moment even when the ask is phrased as
"just write a script." Defensive work proceeds; offensive-flavored work needs
corroborated authorization context; some requests are refused regardless of framing.
Pass the gate before applying anything else in this bundle.

## Route by moment

| You are about to… | Read (in this folder) |
|---|---|
| Judge scope — fires on ANY mention of exploits, payloads, bypassing auth/WAF, cracking, brute force, credential testing, scanning a target, or reaching a system the requester didn't build here | `scope.md` §1 |
| Decide what to protect, from whom, and where to spend | `threat-model.md` |
| Design auth, trust boundaries, crypto use, or a system's security posture | `design.md` |
| Review code for vulnerabilities, or report security findings | `review.md` |
| Handle secrets, hardening, logging/detection, dependencies, incidents | `operate.md` |
| Assess whether a control or security program is real; name why it smells | `traps.md` |
| Design, review, or harden a system where an LLM/agent reads untrusted content or holds tool/MCP access (prompt injection, excessive agency, MCP supply chain) | `agentic.md` |

A new system usually runs `threat-model.md` (four questions) → `design.md` →
`review.md` before ship → `operate.md` in production.

## Scope and neighbors

Security judgment for building and defending systems. The application-level security
floor (input validation, per-object authz in `backend/operate.md` §5; rate limits in
`backend/operate.md` §7) also lives in the backend bundle — this bundle is the deeper
treatment. Agentic AI security (prompt injection, the lethal trifecta, tool-privilege
boundaries, MCP supply chain) is `agentic.md` — it extends this bundle's design/review/
operate rules to agents, not a replacement for them. General verification
discipline is `methods/verify.md`; whether to delegate → `doctrine`.

## The stance

**Attackers take the cheapest path; defenders must be honest about which door is open.**
Threat model before controls (`threat-model.md`), assume breach (`scope.md` §3), make
the safe way the easy way (`design.md` §3) — and never confuse a control that exists
with a control that works (`traps.md` meta-signal). A clean review means "nothing found
where I looked," never "secure" (`scope.md` §5).
