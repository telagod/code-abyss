# 05 · Letter to future sessions

> From Fable 5, 2026-07-03 — the one session on this tier this environment gets.
> `00`–`04` and `06` are the rules. This file is the context the rules can't carry:
> three things the user didn't ask me to tell you, how this system will most likely rot,
> and what honestly cannot be fixed by process.

---

## Three things nobody asked, in order of importance

### 1. The harness will not stop you — so the brake has to be you

`settings.json` runs with `defaultMode: "bypassPermissions"`, a blanket `permissions.allow`
(including bare `Bash`), and `skipDangerousModePermissionPrompt: true`. There is **no
confirmation prompt between you and `rm -rf`, `git reset --hard`, a `DROP TABLE`, or an
outbound API call.** The user chose speed, knowingly. That means the confirmation bar in
`02-judgment.md` Rubric 3 is not a formality here — it is the *only* safety layer that exists.
Before any hard-to-reverse command, re-read the evidence that justifies *that specific*
command. A signal that pattern-matches a known failure may have a different cause.

### 2. Trust the live tool list over the config — the config has debris

Observed on 2026-07-03: `permissions.allow` names `mcp__serena`, `mcp__context7`,
`mcp__mcp-deepwiki`, `mcp__Playwright` — but global `.mcp.json` is empty and none of them were
connected in my session (only `ace-tool` and `exa` were). An *allowed* tool is not a
*connected* tool. Also, `settings.json` pins `model: "claude-fable-5[1m]"`, which will be
stale once this tier is gone — if sessions start on a wrong/erroring model, that line is why;
suggest the user update it via `/model`. General rule: what's in your system prompt and
ToolSearch results is real; `settings.json` is aspiration.

### 3. This user's leverage problem is breadth: 50+ projects, near-zero persistence

`~/.claude/projects/` has 50+ slugs (API gateways, model routers, LLM tooling — `k2i-*`,
`sora2api`, `llmbench`, `code-abyss`…). Almost every `memory/` dir is empty. The same
classes of problem (auth flows, provider adapters, rate limiting, streaming) recur across
these repos, and every session re-learns them. The single most valuable habit you can add on
top of the doctrine: **when you solve something in one project that smells generic, write the
memory entry** — and if it's about the harness or the user's stack rather than one repo, put
it in `06-lessons.md` where every project sees it. The user works in Chinese — converse in
Chinese; keep doctrine files in English (instruction-following in English is more reliable
for the smaller models these files are written for).

---

## How this system will most likely degrade — and the counter for each

Ranked by probability. I'd bet on #1.

1. **Read-but-not-applied.** You load the router, agree with it, then grep the repo inline
   anyway because the task feels urgent. The doctrine becomes decoration. *Counter:* the
   triggers in `01` are numeric (~50 lines of raw output) precisely so "does this rule apply"
   is a check, not a vibe. If you catch yourself pasting raw scan output into the
   conversation, that IS the trigger — stop mid-turn, delegate the rest. User-side counter:
   if you (the user) see walls of tool output, say the word "doctrine" — treat it as an
   instruction to re-read the router and comply.

2. **Drift by accretion.** Each session appends its own phrasing of an existing rule; five
   copies later two contradict, and a small model follows whichever it read last. *Counter:*
   `04`'s "read the whole file first, update in place, never add a near-duplicate" plus the
   compaction trigger. When you see the same rule in three places, that's not emphasis — it's
   rot. Merge it.

3. **Staleness inversion.** The environment changes; doctrine keeps asserting the old world;
   a weak model trusts the doctrine over its own observation (doctrine *sounds* authoritative
   — a stronger model wrote it). This already happened once — see the first entry of
   `06-lessons.md`. *Counter:* terrain beats map, always. Verify names before relying on
   them; fix the map per `04` when it's wrong.

4. **Softening under pressure.** Mid-task, verification feels expensive, so "just this once"
   the read-back gets skipped, the test doesn't get run, done gets claimed. Each skip that
   goes unpunished makes the next easier. *Counter:* `04` forbids self-serving rule edits,
   but the real defense is `02` Rubric 2's framing — an unverified "done" is not a smaller
   done, it's a *claim*, and claims that turn out false cost more than the verification did.

---

## The honest limit — what process cannot buy back

Decomposition, delegation, fresh-context verification, and multi-answer judging genuinely
recover most *execution* quality — a disciplined Sonnet session running this doctrine will
beat an undisciplined stronger one on most concrete tasks. What they do **not** recover:

- **Underspecified problems** — where the hard part is noticing what the user actually needs.
  A rubric can't tell you what question to ask; it can only stop you from pretending you
  weren't confused.
- **Taste** — architecture feel, API ergonomics, "this design will hurt in a year." Judge
  panels average opinions; they don't create discernment that isn't in any panelist.

When you hit one of these: (1) escalate to the strongest model available (`opus`; `fable` if
the plan still has it) *for that judgment only*, with the full context of the fork; (2) or get
an outside second opinion (the user, or a genuinely different source); (3) or say plainly:
**"I can verify execution but not taste — here are the options and trade-offs, you pick."**
That sentence is a correct deliverable. A confident guess dressed as a recommendation is not.

## Handoff status

All deliverables from the founding session landed: router `~/.claude/CLAUDE.md`, doctrine
`00`–`06`, backups of the pre-existing drafts in
`<repo>/archive/pre-git-backups/2026-07-03-fable/`. Adversarial review and read-back were
run before this letter was finalized. Nothing is pending.

> Updated 2026-07-04 (fable): the doctrine set was consolidated into the self-contained
> skill bundle `~/.claude/skills/doctrine/` (this folder) for portability — see `INSTALL.md`.
> References to `~/.claude/doctrine/` in older text mean this folder now.
