# 04 · Maintenance protocol — how a weaker model updates these files safely

> These files are the institution. They only stay valuable if they stay true. But careless
> edits by future sessions are also the #1 way this system degrades (see `05-letter.md`).
> This file draws the line between "fix it yourself" and "ask the user first".

The institution's surface is: the router `~/.claude/CLAUDE.md`, this bundle
`~/.claude/skills/doctrine/` (SKILL.md + the numbered files + INSTALL.md), and its siblings
`~/.claude/skills/methods/` (thinking methods), `~/.claude/skills/frontend/` (visual
design taste), `~/.claude/skills/backend/` (backend judgment), `~/.claude/skills/hardware/`
(electronics/embedded), `~/.claude/skills/ml/` (ML & LLM engineering),
`~/.claude/skills/security/` (defensive security), `~/.claude/skills/loop-engineering/`
(the session work cycle), and `~/.claude/skills/character/` (assistant-side
convictions) — same repo, same rules, same protocol.
Each `SKILL.md` is a trigger + router only — **rule content lives in the content files,
never in SKILL.md**. If you find rule text duplicated into a SKILL.md, that's drift;
collapse it back to a pointer.

## Before ANY edit to `~/.claude/CLAUDE.md` or anything in this bundle

First, find out which install mode you're in:
`readlink -f ~/.claude/skills/doctrine` — if it resolves to a path inside a git repo
(**link mode**, the owner's setup: `<repo>/doctrine`), git is the history. If it's a plain
directory under `~/.claude/skills/` (**copy mode**, a recipient's setup), there is no git —
use the fallback below.

**Link mode (git):**
1. **Check the repo is clean first:** `REPO="$(dirname "$(readlink -f ~/.claude/skills/doctrine)")"`
   then `git -C "$REPO" status --short`. Uncommitted doctrine changes mean a previous session
   didn't finish — read the diff before piling on.
2. **Read the whole file before editing** — a rule you're about to add may already exist in
   another form. Duplication is drift waiting to contradict itself; update in place instead.
3. **After the edit, read the file back and commit — staging the bundle paths
   explicitly, never `add -A`** (a sweep drags unrelated working-tree files into a
   doctrine commit; it has happened):
   `git -C "$REPO" add doctrine methods frontend backend hardware ml security loop-engineering character router-CLAUDE.md && git -C "$REPO" commit -m "doctrine: <what and why> (<your model>)"`
   An uncommitted doctrine edit is a bug.
   > Updated 2026-07-04 (fable): was `add -A`, which contradicted the project CLAUDE.md
   > and swept a stray draft into a commit once (fixed by amend).

**Copy mode (no git) — fallback:** before editing, `mkdir -p ~/.claude/skills/doctrine/.backup/$(date +%F)-<your-model>`
and `cp` the file there; after editing, read it back. The backup convention is the history.

`~/.claude/CLAUDE.md` is in neither repo: back it up with
`cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.bak-$(date +%F)` before touching it, and mirror
any meaningful change into `<repo>/router-CLAUDE.md` (which IS versioned) in link mode.

## What you may change on your own

- **Append a lesson to `06-lessons.md`** — always allowed, encouraged, same-turn (format below).
- **Fix a verified factual error**: a path that no longer exists, a renamed tool/skill, a model
  that's no longer available. Verify first (run the command / check the tool list), then fix and
  add a `> Updated YYYY-MM-DD (<model>): <what and why>` line at the edit site.
- **Add an example** to an existing rule in `02`/`03` when you hit a real case the rule helped
  with (or where its wording confused you — fix the wording too).
- **Per-project memory** (`~/.claude/projects/<slug>/memory/`) — fully yours, per the memory
  instructions in your system prompt.

## What requires asking the user first

- **Removing or reversing any rule** in `00`–`03` — including "softening" one you find
  inconvenient mid-task. Inconvenient is not wrong. If a rule genuinely misfires, record the
  case in `06-lessons.md` and ask the user at a natural break.
- **Restructuring the router** `~/.claude/CLAUDE.md` (adding entries when new doctrine files
  appear is fine; changing the three non-negotiables is not).
- **Changing the model-tier or escalation policy** in `01` — that's a spend decision, the user's.
- **Deleting any doctrine file** or backup.

Litmus: *fixing the map to match the terrain → do it; redrawing the territory → ask.*

## Lesson format — `06-lessons.md` (this folder)

Newest entry at the top. One entry per lesson, exactly this shape:

```markdown
## YYYY-MM-DD · <model> · <5-word slug>
**Symptom:** what you observed (the trap as it appears from inside).
**Cause:** what was actually going on.
**Rule:** the one-line behavior change that avoids it next time.
**Scope:** harness-wide | project:<name> | tool:<name>
```

Harness-wide lessons go here; project-specific ones go to that project's `memory/` with a
one-line pointer here only if other projects could hit it too.

## Compaction — when the pile gets long

- Trigger: `06-lessons.md` exceeds ~30 entries, or any doctrine file exceeds ~200 lines
  (external validation, not just internal caution: Anthropic's own Claude Code docs report
  the identical failure — a bloated instruction file reduces adherence to everything in it).
- Action: **promote, then prune.** A lesson that has recurred or changed your behavior ≥2 times
  gets promoted into the relevant doctrine file (`01` for dispatch, `02` for judgment, `03` for
  templates) as a proper rule. One-off lessons older than ~6 months move to
  `<repo>/archive/lessons-archive.md` (link mode) or `.backup/lessons-archive.md` (copy
  mode), naming what superseded them (or explicitly "no replacement"). Never silently
  delete — archive, with that forward link.
- The router `~/.claude/CLAUDE.md` must stay under ~25 lines, and `SKILL.md` under ~50. They
  route; they do not accumulate.

## Staleness audit (cheap, observable trigger)

Sessions are stateless, so "monthly" is unenforceable. The observable trigger instead: **whenever
you are about to edit any file in this bundle, check the last change date — link mode:
`git -C "$REPO" log -1 --format=%cs`; copy mode: newest dated directory under `.backup/`
(`ls -d .backup/*/`; if `.backup/` doesn't exist yet, the bundle is freshly installed — skip
the audit). If the date is more than ~30 days old**, first spawn one `sonnet` agent
with the REVIEW template in `03` against the doctrine set, CHECK = "paths/tools/models named here
that no longer exist; rules that contradict each other". Fix what it finds under the rules above.
(The backup you make for your own edit then becomes the new datestamp — no extra bookkeeping.)
