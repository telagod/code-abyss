# Select — choose the next unit of work, sized right, matched to your tier

The loop is **select → advance → distill → deliver**, run once per unit of work. A
session is a few loops; a project is many sessions. This file is the entry point:
what to work on next, cut to what size, executed by whom.

## 1 · Enter through the runway, not from zero

On starting work in a project, BEFORE choosing anything:

- Read the project memory index and the runway note at `memory/next.md`, if present
  (written per `deliver.md` §4). No `next.md` = no runway — explore from zero; don't
  hunt for the note elsewhere.
- `git status --short` + `git log --oneline -5` — uncommitted changes mean the previous
  session didn't finish its loop; read the diff before piling on (same rule as
  `doctrine/04-maintenance.md`). **If the diff isn't yours and nothing explains it:
  leave it exactly in place** — never commit, stash, or revert someone else's WIP. Run
  the cheapest ground-truth check (the test suite) to learn whether it's broken, and
  record "unclaimed diff in <files>, tests <pass/fail>, not mine to finish" in the
  runway note. An inherited diff counts against nothing: not WIP=1 (§2), not
  `advance.md` §1's uncommitted-unit rule, not `deliver.md` §4's clean-tree line.
- Verify the note against the terrain: files/sections it names must still exist
  (`doctrine/06-lessons.md` — doctrine goes stale silently). The note is a head start,
  not an order; if the repo contradicts it, the repo wins.

> ✅ Session opens, reads the runway note "next: wire retry into the uploader,
> `src/upload.ts:88`", confirms the file and line still match, starts there — five
> minutes from cold to productive.
> ❌ Session opens, ignores the note, re-explores the repo for 20 minutes, and picks a
> unit the previous session had already parked with a reason.

## 2 · Pick by value, in landable pieces

Highest user value first, and each piece **landed before the next starts**
(`methods/execute.md` §1). When the user named several directions, their stated order
is the default priority; reorder only when value clearly differs — and say you did.
When the user gives no order at all, rank by **cost of delay**: whatever blocks other
work or other people (broken CI, broken build, broken deploy) first, then user-facing
features, then polish/docs — and state the order you chose in your first report.
Never pick two units to run "in parallel" in the main loop: parallel *subagents inside
one unit* are fine, but with two half-done units neither has a commit carrying its
intent when the session ends or compacts. WIP = 1.

## 3 · Size the unit to the context window

A unit = artifact on disk + verified + committed, all inside the current context
window **with headroom** (`methods/execute.md` §5 — budget context like money).

- **Too big (observable):** you cannot state, in two sentences, (a) the artifact this
  unit produces and (b) the check that will verify it. Split until you can.
- **Too small (observable):** the overhead — reading context, committing, reporting —
  exceeds the work itself. Merge it into a neighbor.

> ✅ "Unit: add the `loop-engineering/` bundle's `select.md`; verify: fresh read-back +
> cross-refs resolve." — two sentences, one commit.
> ❌ "Unit: overhaul error handling across the app." — no single artifact, no single
> check; that's a *direction*, not a unit. Cut it into per-module units.

## 4 · Match the unit to your own tier

Know which model you are — the system prompt states it. Map the name to a tier:
contains *haiku* → mechanical; *sonnet* → workhorse; *opus* or *fable* → strong;
unrecognized → assume workhorse (the safe default: you'll escalate judgment cores
rather than trust yourself with them). Sub-task delegation tiers are
`doctrine/01-model-dispatch.md` (its table and ladder). This section is the *unit*-level
call:

- **You're the workhorse tier (sonnet-class).** Most units are yours. Delegate the
  pieces that match `doctrine/01-model-dispatch.md`'s triggers; keep judgment and
  integration.
- **The unit's core is above your tier** — `doctrine/02-judgment.md` Rubric 1 triggers
  keep firing on the same core question. In order of preference: **(a) decompose** —
  carve off the mechanical shell you can do; compress the judgment core into one sharp
  question and escalate it to an `opus` agent with the full trace. Dispatching that
  question ends the current iteration in `advance.md` §1's stopped-with-a-note state:
  write the note (attempts, traces, the dispatched question), mark the unit
  *parked-awaiting-answer* — it no longer counts toward WIP=1 — and re-enter selection;
  when the answer arrives, that unit becomes the top selection candidate. **(b) queue
  it** — write the core into the runway note flagged `needs-stronger-session` and
  select a different unit; **(c) ask** the user to switch `/model` for this unit.
  Never grind a hard core at your own tier past Rubric 4's three-variation cap
  (`doctrine/02-judgment.md`).
- **You're a strong/expensive tier.** Spend yourself on judgment cores, design, and
  verification; push mechanical application down (`doctrine/01-model-dispatch.md`
  de-escalation). A strong session that spent its budget on grep and formatting is a
  dispatch failure.

> ✅ A sonnet session hits an architecture fork it can't resolve, writes both options +
> constraints into one question, gets an `opus` agent's pick, and implements it itself.
> ❌ The same session re-reads the two options five times, picks one "by feel," and
> builds on it — the exact call Rubric 1 says it can't make alone.

## 5 · Re-select after every loop

Selection is not a one-time plan. After each unit lands, re-run this file: the user may
have replied, the terrain changed, or what you learned re-ranks the remaining units.
A plan written at loop 1 and obeyed at loop 6 without re-checking is stale doctrine.
