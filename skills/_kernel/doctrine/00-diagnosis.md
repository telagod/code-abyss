# 00 · Harness Diagnosis — the 3 things that waste the most, lose focus the most, break the most

> Written by Fable 5 (2026-07-03) for the Sonnet/Opus/Haiku sessions that come after.
> This file is the *why* behind the other doctrine files. Read it once; the fixes live in
> `01`–`06` and the router `~/.claude/CLAUDE.md`.
> Every claim below was verified against this exact environment on the date above.
> (A prior draft of this file referenced a 361-line `~/.claude/CLAUDE.md` and an `abyss-cultivator`
> output style; those no longer exist. The old draft is archived in
> `<repo>/archive/pre-git-backups/2026-07-03-fable/`.)

Read this as: **problem → proof it's real → the concrete fix (with the file that implements it).**

---

## #1 — There is no institutional memory at session start: every session re-derives everything

**Problem.** Until this doctrine set existed, `~/.claude/CLAUDE.md` was **missing entirely** and every
project-level `CLAUDE.md` in active use was absent or thin. Consequences, per session:

1. The model doesn't know `doctrine/` exists → none of the rules below get applied.
2. Per-project memory (`~/.claude/projects/<slug>/memory/`) is mostly empty → lessons already paid for
   (e.g. the Bash flush bug, recorded in the `code-abyss` project's memory) get re-learned at full price.
3. Habits like delegation and verification depend entirely on the model's defaults — and smaller models
   default to doing everything inline and self-certifying.

**Proof it's real.** On 2026-07-03: `test -f ~/.claude/CLAUDE.md` → missing. `~/.claude/projects/` shows
50+ project slugs; nearly all memory dirs are empty. The one project that *did* record a lesson
(`code-abyss` → `bash-output-flush-delay.md`) is invisible to every other project.

**Fix.** The router `~/.claude/CLAUDE.md` (written alongside this file) now loads in every session and
points here. It states the three non-negotiable habits inline and routes everything else to `doctrine/`.
- **Rule for future sessions:** when you learn something that will bite again (a harness quirk, an
  environment fact, a failed approach), write it down *the same turn* — project-specific facts go to that
  project's `memory/`, harness-wide facts go to `06-lessons.md` (this folder) (format in `04-maintenance.md`).
  A lesson that exists only in the conversation is a lesson the next session pays for again.

---

## #2 — The commander goes down onto the field: heavy reads/scans/web run inline, bloating and de-focusing the main context

**Problem.** Nothing in the environment tells the main model *where* work should run, so it does
everything itself: greps the whole repo, reads five 800-line files, fetches web pages, batch-edits twenty
files — and every byte of raw tool output lands in the main context window. Two costs:

1. **Token waste:** raw scan/read/fetch output is 10–50× larger than the conclusion actually needed.
2. **Focus loss (the bigger one):** the main thread's job is to *decide and integrate*. When its context
   fills with grep dumps and file bodies, the original goal gets buried. Smaller models are far more
   sensitive to this — a Sonnet/Haiku session that has read 6k lines of raw output inline has usually
   lost the plot. Context compaction then summarizes away exactly the details it should have never loaded.

**Proof it's real.** The environment ships 6 subagent types (`Explore`, `general-purpose`, `Plan`,
`claude`, …), the `Workflow` orchestration tool (main session only — subagents don't get it), and agent
teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `settings.json`) — and before this doctrine, zero
standing instructions to use any of it. The
capability exists and was unused by default. That gap is the finding.

**Fix — the delegation discipline in `01-model-dispatch.md`.** One-line version: **the main dialogue
receives conclusions, not raw output.** Delegate any task that would dump more than ~1 screenful of raw
text into your context — repo-wide scans, multi-file reads, web research, batch edits. The subagent
returns only *conclusion + `file:line`*; long artifacts go to a file and it returns the path.
Paste-ready dispatch prompts are in `03-delegation-templates.md`.

**Why it matters for you (a smaller model):** delegation is the single highest-leverage habit for a
smaller model in a long session. It keeps your working context small and on-goal, and it lets you spend a
*stronger* model on the one sub-task that needs it while you stay cheap. Not delegating is the #1 reason
long sessions degrade.

---

## #3 — Tool output gets trusted without verification, and work gets self-certified

Two variants of the same root failure — **acting on unverified signals**:

**(a) The Bash empty-flush bug.** In this harness, `Bash` sometimes returns an **empty** result and
flushes the real output later. The failure mode: you see empty, conclude "the command found nothing /
failed", and either retry (burning tokens) or — worse — *act* on the empty result as if it were the
answer ("grep found nothing → the pattern doesn't exist" when it does).

**Proof it's real.** Recorded from direct experience in
`~/.claude/projects/-home-telagod-project-code-abyss/memory/bash-output-flush-delay.md`
("本会话 Bash 常空返回后才 flush；用「写文件 + Read」取代反复重试"). Verified to exist on 2026-07-03.

**Fix — the write-then-Read pattern.** For any Bash command whose output you must *act on*:

```bash
your_command > /tmp/out.$$ 2>&1; echo "EXIT=$?"
```

Then `Read` the file. The filesystem is durable; the flush race only affects the inline return channel.
- **Never** treat an unexpectedly-empty Bash return as a real result. Empty ≠ "nothing found".
- **Never** retry the same command more than **once** on empty. Second empty → switch to write-then-Read.

**(b) Self-certification.** An agent (including you) claiming "done / fixed / verified" about its own
work is a claim, not a verification — it shares the blind spot that produced the error. Smaller models
do this *more*, and more confidently.

**Fix.** The verification rules in `01-model-dispatch.md` → "Verification does not self-certify" and the
done-gate in `02-judgment.md` → Rubric 2. Short version: file writes → fresh read-back; code changes →
run the tests or the actual path (the `verify` skill exists for exactly this); high-stakes judgment →
independent refuter or multi-answer judging.

**Why it matters for you:** a false "done" is strictly worse than an honest "blocked" — it propagates
downstream and the user discovers it late, when it's expensive. This is the most dangerous silent
failure in this harness.

---

## How these three connect

- #1 is about what you know **before** work → fixed by the router + memory discipline.
- #2 is about **where** work runs → fixed by delegating so the main context stays a decision surface.
- #3 is about what you trust **during and after** work → fixed by write-then-Read + fresh-context verification.

All three share one root cause: **the main context is a scarce, load-bearing resource, and nothing in
the default setup treats it as scarce.** The rest of this doctrine set is, in effect, a budget for it.
