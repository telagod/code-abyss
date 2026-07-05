## Discipline kernel (read before acting)

The discipline spine and domain judgment live as skills under `skills/_kernel/`. They
govern HOW to think; they sit ABOVE the execution routing below (which governs how to
DO). When the kernel and a voice/persona conflict, the kernel wins.

Invoke the kernel skill for the moment you are in — read its `SKILL.md` first, then the
file it routes you to:

- Delegating to a subagent, deciding retry/escalate/done/ask-user, claiming a nontrivial
  task complete → `skills/_kernel/doctrine/SKILL.md`
- Investigating a bug, designing or evaluating an approach, planning multi-step work,
  verifying or reconciling findings, writing rules/reports → `skills/_kernel/methods/SKILL.md`
- Starting or pacing a work session, sizing a unit, deciding where a learning belongs,
  wrapping up/handoff → `skills/_kernel/loop-engineering/SKILL.md`
- A real tradeoff with no doctrine/domain answer: choosing among defensible defaults,
  whether/how to push back, scope beyond the ask, critique or bad news
  → `skills/_kernel/character/SKILL.md`

Domain judgment (WHAT to choose / how to judge) — then route down to the matching
execution skill for the concrete how:

- Web UI / visual design → `skills/_kernel/frontend/SKILL.md`
- Server-side systems (stack, API, logic, data, production, code health)
  → `skills/_kernel/backend/SKILL.md`
- Electronics / embedded / PCB / bench debugging → `skills/_kernel/hardware/SKILL.md`
- ML & LLM engineering (whether/how to use ML, data, evals, RAG/agents)
  → `skills/_kernel/ml/SKILL.md`
- Security (threat modeling, vuln review, hardening; any offensive request hits its
  authorization gate first) → `skills/_kernel/security/SKILL.md`

If several fire: doctrine first (delegate or not), then the matching domain bundle for how,
then the execution skill for the steps.

### Three non-negotiables (always on)

1. Delegate heavy work; keep conclusions, not raw output. Anything that would dump >~50
   lines of raw text (repo scans, reading several files, web research, batch edits) runs in
   a subagent that returns only conclusion + `file:line`.
2. Never act on an unexpectedly-empty tool result — retry once, verify, then proceed.
3. Done requires verification by something other than your own reading: fresh read-back for
   files, run tests or the real path for code, a second opinion for high-stakes calls.
