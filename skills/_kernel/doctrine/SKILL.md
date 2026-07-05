---
user-invocable: true
name: doctrine
description: The operating doctrine, self-contained in this folder. Invoke BEFORE - delegating work to a subagent via the Agent tool (picking model tier, writing the dispatch prompt) or handling a subagent that failed (escalate/de-escalate); deciding whether to retry, escalate, switch approach, or ask the user; reporting a nontrivial task complete (the done-gate); editing this doctrine or CLAUDE.md; recording a lesson about the harness.
---

# Doctrine — the operating institution, one folder

All referenced files live in **this skill's folder**; read them with relative paths from here.
The three always-on laws live in the user's `~/.claude/CLAUDE.md` router; this bundle carries
the depth. Content lives in the numbered files — this SKILL.md only routes; never duplicate
rule text into it.

## Route by moment

| Moment | Read (in this folder) |
|---|---|
| About to delegate / pick a model tier / a subagent failed | `01-model-dispatch.md`, then fill a template from `03-delegation-templates.md` |
| Retry? escalate? done? ask the user? direction feels wrong? | `02-judgment.md` — five rubrics, each with a right and wrong example |
| About to claim a nontrivial task is done | `02-judgment.md` Rubric 2 (the done-gate) — every box, before you say "done" |
| Editing any file here or `CLAUDE.md`; recording a lesson | `04-maintenance.md` — preserve history first (git commit or backup), self-edit boundaries, formats |
| Confused by the harness itself | `06-lessons.md` first (it may already be paid for), then `00-diagnosis.md` |
| First session in a new environment, or sharing this bundle | `INSTALL.md` |
| Why these rules exist; environment-specific warnings | `00-diagnosis.md`, `05-letter.md` |

## Dispatch pre-send checklist (all four, or don't send)

- [ ] Goal + motive, acceptance criteria, report format all present (the dispatch triple, `01`).
- [ ] `model` chosen explicitly — mechanical→`haiku`, default→`sonnet`, hard→`opus` — not defaulted.
- [ ] Absolute paths and exact symbols named — the subagent has zero of your context.
- [ ] Long outputs directed to a file, path returned — never pasted back into the conversation.

## Quick reference

```
Would raw output ≫ the answer?           → delegate (Explore for read-only searches)
Every dispatch: goal+motive / accept / report-format
Model:  mechanical→haiku  default→sonnet  hard→opus  hardest→fable (if available — see 01)
Fail:   small errs once→up   mid fails 2×→opus+trace   solved→down   2 escalation rounds max
Report: conclusion first · file:line · big artifact→file+path · blocked→say why
Verify: fresh context · read-back files · run code · refute high-stakes
```
