# Advance — drive the unit to landed; detect stalls; pace yourself

Selection (`select.md`) chose the unit; this file is how it moves. The through-line:
**progress is measured in landed deliverables, not in activity.**

## 1 · The iteration contract

Every loop iteration ends in one of exactly two states:

1. **Landed:** artifact on disk, verified by something other than your own reading
   (`deliver.md` §1), committed (or explicitly parked with a written reason in the
   runway note — `methods/execute.md` §6).
2. **Stopped-with-a-note:** you hit a blocker; the runway note (`deliver.md` §4) says
   what blocked you and what you tried.

There is no third state. "Mostly done, will commit after the next piece" is how work
dies at compaction — assume any iteration could be your last (context compaction,
crash, user interrupt) and write as you go. Never open unit N+1 while unit N sits
uncommitted.

## 2 · Climb on verified rungs

Within the unit, verify each step before building on it (`methods/execute.md` §2);
when checking your own product, execute the promised journey, not just the artifact
(`methods/verify.md` §2). The expensive failure is stacking three steps on an
unverified first step and debugging the tower.

## 3 · Stall detection — the loop-level counter

The inner counters are per-approach and per-subtask: three variations of one fix
(`doctrine/02-judgment.md` Rubric 4), two escalation rounds
(`doctrine/01-model-dispatch.md`'s ladder). The loop adds an outer counter:

**Two consecutive attempts with nothing landed → the unit is mis-scoped or the
approach is wrong.** An *attempt* is one attempt-and-check cycle — you ran the unit's
verification (pass or fail) or abandoned one tactic for another; a fix that ran and
failed its check counts, committed or not, and a stretch of work that never reached a
check counts as one failed attempt at the moment you'd start a new tactic. Failed
attempts *inside* a unit owe no note — §1's two end states describe how your
engagement with the unit ends, and this counter is what decides that it ends: when it
fires, stop pushing and either shrink the unit (`select.md` §3) until one piece can
land, or switch approach per Rubric 4 — landing in §1 state 1 or state 2 either way.
These counters are **independent triggers, not a menu** — the FIRST one to fire stops
you; a looser counter that hasn't fired yet never grants extra attempts. Motion
without landings is the loop's failure state — it *feels* like work and produces
nothing a future session can stand on.

> ✅ Two attempts spent fighting a flaky integration test with nothing committed.
> The session stops, lands the non-flaky 80% as its own commit, and parks the flaky
> case as a `needs-stronger-session` runway item with the failure trace.
> ❌ Attempt three: "almost have it" — still nothing on disk. Then compaction hits
> and all three attempts evaporate.

## 4 · Pacing when running unattended

Running autonomously (a `/loop`, a scheduled task, a long background plan):

- **Harness-tracked work** (subagents, background Bash, workflows) re-invokes you when
  it finishes — do NOT poll it. Set only a long fallback wake (20+ minutes) in case it
  hangs.
- **External state** the harness can't see (CI, a deploy, a human's reply) — poll at
  that state's real cadence, not at your anxiety's. Anchors: CI/deploy → the job's
  typical runtime (read its recent run durations; default ~10 min); a human's reply →
  30+ min; after two consecutive no-change polls, double the interval.
- **On each wake:** re-read the runway note; if nothing actionable changed, lengthen
  the interval and go back to sleep. Inventing work to justify a wake is how loops
  turn into noise.
- Scheduling tools differ by harness — check your tool list before citing one
  (`doctrine/06-lessons.md`: tool surfaces differ by role).

## 5 · Survive compaction by keeping state on disk

Long sessions get compacted; the summary keeps conclusions but loses detail. Don't
fight it — make it not matter: decisions, findings, and next-steps live in files
(commits, memory, the runway note), never only in the conversation. The observable
test: **if this conversation vanished right now, what would be lost?** If the answer
is anything you'd mind losing, write it down before the next step.

And the reader side: when you notice compaction already happened (a summary stands
where the conversation was), treat it as **re-entry** — before the next action, re-run
`select.md` §1's checks (git status/log, memory, the runway note, open subagent
results) and trust the disk over your recollection, which is now exactly the
conclusions-without-detail this section warns about. When the user's ask is complete,
don't linger — close the loop (`distill.md`, then `deliver.md`) and end on the
delivered result.
