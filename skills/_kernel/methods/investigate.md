# Investigate — diagnosis, root cause, unfamiliar terrain

## 1 · Survey before you build

Before acting on ANY plan, spend the first minutes inventorying the terrain: what already
exists (files, configs, prior work), what's actually connected (tools, services), what past
sessions recorded (memory, lessons). The environment usually contains a surprise that
changes the plan.

> ✅ The founding session was asked to write doctrine from scratch. It surveyed first and
> found three draft files from an interrupted prior session — strategy switched from
> write-new to repair-and-extend, saving the good work and fixing its stale claims.
> ❌ Writing the "new" doctrine immediately would have silently forked two competing rule
> sets — the exact drift the doctrine warns about.

## 2 · Evidence has a rank order

When sources disagree: **runtime behavior > state on disk (source & config files as they
actually exist) > docs/comments > memory/hearsay.** A claim from a lower tier never
overrides a higher tier; it only tells you where to look. (This ordering is canonical —
`doctrine/02` Rubric 4 points here; don't restate it elsewhere.)

> ✅ A prior draft described a 361-line CLAUDE.md; `test -f` said the file didn't exist.
> Filesystem beat document — the draft was archived and rewritten.
> ❌ "The doc says the flag exists, so the runtime must be misconfigured" — backwards.

## 3 · Label every belief: verified-now or hearsay

A fact is *verified* only if THIS session checked it (ran it, read it, listed it). Date
your verifications when you write them down. Prior sessions' notes, docs, and your own
training knowledge are hearsay until re-checked — usually one cheap command away.

> ✅ Doctrine 00 states "Every claim below was verified against this exact environment on
> the date above" — and each claim carries its check (`test -f`, settings key, memory path).
> ❌ The prior draft cited a skill named `orchestrating-adversarial-reviews` that never
> existed — plausible-sounding hearsay, shipped unverified, caught only by review.

## 4 · Two conflicting observations → find the frame where both are true

When two trusted sources contradict, don't average them and don't pick a winner. Ask: *under
what conditions would both be correct?* The reconciling frame is usually the real finding —
and often a lesson worth recording.

> ✅ A fresh-context reviewer reported "the Workflow tool does not exist"; the main session
> demonstrably had it. Both true: the tool is exposed to the main loop only — subagents
> never see it. That scoping rule became a permanent lesson (doctrine `06`).
> ❌ "The reviewer must be wrong, ignore the finding" — or worse, "I must be wrong, delete
> the reference" — either discards half the evidence.

## 5 · Anomaly protocol: stop, re-verify, report, repair — never explain away

Something impossible happened (a file you created is gone; output contradicts what you just
saw)? Stop the current step. Re-verify through an independent channel (different command,
write-to-file-then-read). Report it plainly in your output even if embarrassing. Repair
what you can, and leave a written note where the anomaly lived.

> ✅ A backup directory verified at creation later vanished from disk mid-session. The
> session re-checked via `find` + `ls` to a file, reconstructed the contents from context,
> and left a `RECONSTRUCTED.md` note explaining the provenance — then told the user.
> ❌ Quietly recreating the directory and moving on: the history now lies, and whatever
> deleted it is still unexplained and still active.

## 6 · Differential diagnosis: two hypotheses minimum, cheapest discriminating test first

Before acting on a cause, write down at least two candidate causes, then pick the test that
best *separates* them — not the test most likely to confirm your favorite. A test that
passes under both hypotheses taught you nothing.

> ✅ Empty Bash output: hypothesis A "command found nothing", hypothesis B "output channel
> lost it". Discriminating test: redirect to a file and read the file — one command,
> separates the two perfectly. (B turned out to be a real harness bug.)
> ❌ Re-running the same command inline three times: each rerun is a confirmation-shaped
> test that cannot distinguish A from B — three data points, zero information.
