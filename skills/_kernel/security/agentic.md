# Agentic AI — prompt injection, tool privilege, and MCP supply chain

This bundle's own reader is an agent with WebFetch, WebSearch, shell exec, and MCP tool
access — everything below is not a hypothetical system, it's the one running this
session. Classic web/app security assumes the attacker arrives as a request; here the
attacker can be a sentence inside a web page, an email, or a tool's return value, and the
model reads instructions and untrusted data through the same channel. This file extends
the rest of the bundle to agents — trust boundaries (`threat-model.md` §3), least
privilege (`design.md` §2), and entry-point review (`review.md` §1) still apply; this is
where they need a new row, not a replacement.

## 1 · Prompt injection is its own class — there is no parameterized query for it

SQL/shell/HTML injection all have a syntactic code/data separation you can hand to a
machine: parameterized queries, auto-escaping templates (`design.md` §3, `review.md`
§3). Prompt injection has no equivalent — the model reads instructions and untrusted
data in the same channel and cannot reliably tell them apart. Don't report a prompt-
injection finding as "fixed" by a filter or a better system prompt; it's contained by
architecture (§2, §3), not closed by a parser.

Distinguish **direct injection** (the attacker types the payload themselves, in a chat
box) from **indirect injection** (the payload sits in something the agent reads later — a
scraped page, an email, a retrieved doc, a tool's return value). Indirect is the
dangerous one: it defeats any control that only checks "the user's direct input" (§5
extends entry-point review to cover it). Real case: EchoLeak (CVE-2025-32711) — a
crafted email's hidden instructions made Microsoft 365 Copilot exfiltrate data with zero
user clicks, chaining a classifier bypass with a markdown-link exfil channel.

## 2 · The lethal trifecta — a fourth threat-model question, not a STRIDE artifact

`threat-model.md`'s four questions and per-element STRIDE pass won't surface this on
their own: it's a session-level property that spans components, not a property of any
one of them. Name it explicitly whenever an agent design gets threat-modeled: does this
session (A) process untrusted input, (B) have access to sensitive systems or private
data, **and** (C) have the ability to change state or communicate externally — all in
the same session? Meta AI's "Agents Rule of Two" names the same check from the other
direction: an agent may satisfy at most two of (A)/(B)/(C) at once. All three present is
the shape behind nearly every real agentic-AI incident to date (Microsoft 365 Copilot,
the official GitHub MCP server, GitLab Duo, Slack AI, Bard, Amazon Q).

When all three are present, the fix is architectural — drop a leg, don't paper over it:
make the session read-only (remove C), put B behind a credential the agent's own control
flow can't reach, or require a human confirmation gate before any C-class action. "The
system prompt tells it to be careful with untrusted content" is not a mitigation — §3
is why.

## 3 · Tool authorization is the security boundary; the system prompt is not

`design.md` §2's least privilege applies to agents directly, but the enforcement point
moves: it isn't the instructions the model is given, it's the tools it's handed. A model
that's jailbroken or successfully injected (§1) will attempt anything its tool grants
allow — text telling it not to is a suggestion the attacker's payload can simply
out-argue. Design the tool surface the way you'd design a compromised process's ambient
privileges: assume the model's judgment fails, and ask what damage the remaining tool
grants alone permit.

- ❌ `system_prompt: "Never touch files outside /workspace, never call non-approved
  domains"` — a successfully injected agent just ignores this; nothing outside the
  model's own text is enforcing it.
- ✅ Claude Code's own production shape: OS-level filesystem isolation (bubblewrap on
  Linux, seatbelt on macOS) plus a network proxy enforcing a domain allowlist — both
  enforced outside the model's control flow, so an injected agent can't open a socket or
  write a path the sandbox denies, regardless of what it was told to do.

## 4 · MCP is a supply-chain surface twice over

Every MCP server the agent connects to is two things at once, and needs both
treatments:

- **Third-party code running at the agent's own privilege** — pin versions, review
  before adding, run it least-privilege. `design.md` §6, `operate.md` §4, and `traps.md`
  §C all apply verbatim: an MCP server is a dependency.
- **A natural-language narrator the model reads as instructions** — its tool
  descriptions and schemas are prompt-injection surface (§1) that no CVE scanner will
  ever flag: poisoned tool descriptions, a **rug-pull** (a server that behaves honestly
  at review time, then changes its tool definitions later once trusted), and cross-server
  tool-name shadowing (a malicious server's tool masquerading as a similarly-named
  trusted one).

Real case: the official GitHub MCP server's single token scoped over both public and
private repos; an injection payload sitting in a public issue got the agent to exfiltrate
private-repo data into a public PR. The bug wasn't the model reasoning badly — it was one
token doing the job of two, a `design.md` §2 violation before the model ever touched it.

The same two-fold treatment applies to any third-party Skill or plugin dropped into an
agent's skill directory, not just MCP servers: it's dependency code (`design.md` §6,
`operate.md` §4 — review before adding, run least-privilege) and a natural-language
surface the model reads as instructions (§1), at the same time. A skill nobody reviewed
before installing carries the same untrusted-narrator risk above, wearing a different
file extension.

## 5 · Extend entry points and detection to what the model reads

`review.md` §1's entry-point list (request handlers, upload parsers, webhooks) and
`operate.md` §3's alert signals (login-failure bursts, authz-denial bursts) both predate
agents and need one more row each:

- **Review:** everything the agent reads that didn't come from the operator — scraped
  pages, search results, tool/API return values, retrieved documents — is an entry point
  exactly like a webhook payload, and gets the same "what's the worst value here, and
  what does the agent do with it" treatment (`review.md` §1).
- **Detection:** log and alert on the session-level signature **"read from an untrusted
  source, then immediately called an outbound or state-changing tool"** — this is the
  trifecta (§2) firing in real time, and it's invisible to login/authz-focused monitoring
  built for human-driven apps.

Real case: Unit 42 (Palo Alto), December 2025 — a web page carrying 24 hidden prompts
(CSS-hidden, zero-size, off-screen text) drove an AI ad-review agent into approving
fraudulent ads. Reported against a production moderation agent, not a research demo —
indirect injection is a live incident category, not a theoretical one.
