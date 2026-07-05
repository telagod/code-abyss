# Execute — multi-step work that survives interruption

## 1 · Value order × crash safety: land each item before starting the next

Sort deliverables by value, do the highest first, and **write it to disk before touching the
next**. Assume the session can die between any two tool calls — whatever is on disk at that
moment is the entire delivery.

> ✅ The founding session wrote diagnosis → router → dispatch → judgment as separate files,
> each complete on disk before the next began (per its own handoff account in
> `doctrine/05-letter.md`; git was initialized later, so the log can't show the order). An
> interruption after any step would still have delivered everything before it.
> ❌ Drafting all seven documents "to polish them together at the end" — an interruption
> delivers zero, regardless of how much thinking happened.

## 2 · Verify each rung before climbing onto it

When a plan stacks step B on step A's success, test A *in reality* before building B.
The cheapest possible probe is fine; the point is that it's real.

> ✅ Before restructuring everything around "the skill directory can be a symlink into the
> repo", the session created the symlink and actually invoked the skill through it. Only
> after it demonstrably loaded did the git-repo architecture proceed.
> ❌ Building the repo + install script + docs around the symlink assumption, then
> discovering at the end that registration doesn't follow links — full rework.

## 3 · Reversibility ladder: park, don't destroy

Prefer the most reversible operation that achieves the step: copy-aside > move-aside >
overwrite > delete. Delete only what you can prove is duplicated elsewhere — and after the
proof, not before. When you must overwrite a file, back it up in the same command.

> ✅ The old doctrine layout was removed only after every file was verified present in the
> new bundle, with the old versions parked in `archive/`; the installer *moves* an existing
> copy aside with a timestamp rather than deleting it.
> ❌ `rm -rf` on the old directory first because "the copy probably worked" — the founding
> session had a backup directory *vanish* mid-session; "probably" is not provenance.

## 4 · Batch what's independent; serialize what isn't

Fire independent operations together (parallel tool calls, one message). But if step B's
input depends on step A's output, wait for A — guessing B's input to save a round-trip
costs more when the guess is wrong.

> ✅ Backing up three files + fact-checking four environment claims: one batched message.
> ❌ Running "fix the reference" in parallel with "find out what the correct reference is".

## 5 · Budget context like money

Your context window is a shared budget for the whole task. Before any big read, ask what
the minimum sufficient slice is (`offset`/`limit`, `grep` first, delegate whole-file work).
Spending 2k lines of context to make a 2-line edit is a real loss even when it "works" —
that context is unavailable for the rest of the task.

> ✅ Needing to fix one dead path in a 100-line file: read 12 lines around the target, edit.
> Needing findings from a 4-agent review: extract just the findings via `jq` to a file,
> read that.
> ❌ Re-reading three full files "to be safe" before three one-line edits — the safety is
> imaginary and the cost is the summary quality at the end of the session.

## 6 · Leave the campsite labeled

At every stopping point (including unplanned ones), the disk should explain itself: work
in final locations, anomalies noted next to where they live, a handoff note if anything is
half-done. The next session (or the next model) starts from files, not from your memory.

> ✅ The reconstructed backup carries a `RECONSTRUCTED.md` stating what vanished and how
> the contents were restored; the letter file ends with an explicit handoff-status section.
> ❌ A scratch directory of `final2-real.md`, `test-copy/`, and an in-context-only plan —
> the next session spends its first hour reverse-engineering yours.
