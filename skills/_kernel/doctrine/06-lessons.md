# 06 · Lessons log — paid for once, reusable forever

> Append-only, newest first. Format defined in `04-maintenance.md`. Check here BEFORE
> debugging a harness quirk — it may already be solved.

## 2026-07-04 · fable · skill registration is async, both directions
**Symptom:** A skill created mid-session (tested for BOTH `~/.claude/skills/` and project-level `<project>/.claude/skills/`) was absent from the available-skills list on the immediately following turns; the announcement fired several turns later — after the test dirs had already been deleted, so the deleted skills also lingered in the list.
**Cause:** The harness refreshes skill registration asynchronously on some later turn, not at file-creation time. The list lags both creation and deletion.
**Rule:** Project-level `<project>/.claude/skills/<name>/SKILL.md` DOES register. Never judge registration by immediate absence (that's lag, not failure) or post-deletion presence (staleness, not resurrection) — confirm a few turns later or next session. This supersedes the "registered instantly" wording in the `skills/local/` lesson below.
**Scope:** harness-wide

## 2026-07-04 · fable · new bundles leak bare cross-bundle refs
**Symptom:** Both `hardware/` and `ml/`, authored by pattern-matching an existing bundle, cited sibling-bundle content with a bare path (`` `stack.md` `` instead of `` `backend/stack.md` ``). A weak reader following the "bare path = in-folder" convention hits a missing file and silently drops the rule.
**Cause:** When authoring a bundle by imitating another, in-folder refs get copied verbatim without re-checking that the target still lives in *this* folder.
**Rule:** After writing/editing any bundle, grep it for bare `` `<file>.md `` refs and confirm each target exists IN THAT folder; anything pointing at a sibling bundle must carry the `<bundle>/` prefix and a verified `§N`. Cheap check: `grep -rnE '\`[a-z-]+\.md' <bundle>/` then eyeball each hit.
**Scope:** project:mythos

## 2026-07-04 · fable · symlinked skill dirs work fully
**Symptom:** Needed the skill bundle to live in a git repo but load from `~/.claude/skills/`.
**Cause:** n/a — capability test. `~/.claude/skills/doctrine` as a symlink to `/home/telagod/project/mythos/doctrine` was verified end-to-end: registration, `/doctrine` invocation, and base-directory resolution all work through the link.
**Rule:** A skill directory may be a symlink into a repo — edits made via either path land in the same file, and git becomes the history. Verify registration once after creating the link.
**Scope:** harness-wide

## 2026-07-04 · fable · skills under skills/local/ never register
**Symptom:** `~/.claude/skills/local/auditing-own-changes/` and `.../optimizing-backend-performance/` exist with valid SKILL.md files but never appear in any session's available-skills list.
**Cause:** Skills must live directly at `~/.claude/skills/<name>/SKILL.md`; the extra `local/` nesting makes them invisible. (Confirmed: `skills/dispatch/` registered instantly on creation; the `local/` ones never did.)
**Rule:** Create skills at `~/.claude/skills/<name>/SKILL.md`, no intermediate dirs. After creating one, confirm it shows up in the skill list before relying on it. The two `local/` skills need moving up one level if the user still wants them.
**Scope:** harness-wide

## 2026-07-04 · fable · Workflow tool is main-session-only
**Symptom:** A subagent asked to verify the `Workflow` tool's existence found it missing from its tool surface (ToolSearch returns nothing) and concluded it doesn't exist at all.
**Cause:** `Workflow` is exposed only to the main conversation loop; subagents never receive it. Tool surfaces differ by role.
**Rule:** Before calling or citing `Workflow`, check your own tool list. Absent → you're probably a subagent or the harness changed: fan out with multiple `Agent` calls in one message instead. More generally: a subagent's report "tool X doesn't exist" only proves it doesn't exist *for that subagent*.
**Scope:** harness-wide

## 2026-07-03 · fable · doctrine can go stale silently
**Symptom:** A prior doctrine draft confidently described a 361-line `~/.claude/CLAUDE.md` and an output style that no longer existed; a skill it cited was never in the skill list.
**Cause:** Environment changed (or the draft described a different machine state); nothing re-verified the claims.
**Rule:** Before citing a file/tool/skill by name in any doctrine or dispatch, verify it exists *now* (test -f, tool list, skill list). Doctrine describes the terrain; when they disagree, the terrain wins.
**Scope:** harness-wide

## 2026-07-03 · fable · Bash returns empty, flushes late
**Symptom:** Bash tool result comes back empty; the real output appears attached to a later call. Naive reaction is to retry repeatedly or conclude "nothing found".
**Cause:** Output-flush race in the harness's inline return channel; the filesystem is unaffected.
**Rule:** Output you must act on → `cmd > /tmp/out.$$ 2>&1; echo "EXIT=$?"` then Read the file. An *unexpectedly*-empty result ≠ no results — when a negative is plausible, confirm via write-then-Read before trusting it. Max one inline retry, then switch to write-then-Read.
**Scope:** harness-wide (first recorded in project:code-abyss memory)
