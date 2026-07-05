# Deliver — close the loop so it counts (交付)

Delivery is what converts an iteration's work into something the user and the next
session can stand on. Four parts, all mandatory: the gate, the commit, the report,
the runway.

## 1 · The gate — done means verified

Run the done-gate before claiming anything: `doctrine/02-judgment.md` Rubric 2, every
box. The load-bearing box: **verified by something other than your own reading** — a
test ran, the path executed, a fresh-context agent read it back
(`methods/verify.md`). If the unit can't pass the gate, it isn't delivered — report
it as in-progress or parked, which is honest, instead of "done," which is a claim.

## 2 · The commit — scoped, explained, immediate

- Stage **only this unit's files** — never `git add -A` sweeps that drag strangers
  into the commit.
- Message = what + why + who: `<area>: <what and why> (<your model>)`.
- Commit at the moment the unit lands, not "at the end" — a commit carries its own
  explanation through compaction; uncommitted changes survive on disk but their
  *intent* doesn't, and work that exists only in the conversation is lost outright
  (`advance.md` §1, §5).
- In a repo where commits weren't sanctioned (no user ask, no project rule like this
  repo's CLAUDE.md): get one-time consent at the first landing ("commit each unit as
  it lands?"); refused or unaskable → park on a branch/stash with a runway-note entry
  instead. Never leave silent uncommitted changes as the end state.

## 3 · The report — conclusion first, verification named

What re-enters the user's attention is a report, and reports lead with the outcome
(`methods/communicate.md` §2):

- **What landed**, as paths/commits — point, don't paste.
- **How it was verified** — name the actual check that ran ("test X passes",
  "read back by a fresh agent"), not the genre of check ("it was tested").
- **Risks and leftovers, stated** — what you couldn't verify, what you parked, said
  as precisely as what you did (`methods/communicate.md` §5).

One report per unit, or batched at a natural break — match the user's cadence, but
never let three units land silently.

## 4 · The runway — what you leave the next session

Refresh the runway **after every landed unit** — it's one cheap edit; don't wait for
a "context running low" feeling you can't measure. If the harness surfaces a
compaction or context-limit signal, treat the session as ending now: write the runway
before any other action. Leave the campsite labeled (`methods/execute.md` §6):

- **Clean tree:** everything *of yours* committed or explicitly parked with a reason.
  An inherited stranger diff (`select.md` §1) is noted in the next-note, never swept
  into a commit to satisfy this line.
- **Memory current:** project facts learned this session are filed (`distill.md` §1).
- **The next-note, at `memory/next.md`** — one canonical file, overwritten each time
  (`select.md` §1 reads exactly this path): (a) the next unit and why it's next,
  (b) the first concrete command or file to open, (c) any `needs-stronger-session`
  flags from `select.md` §4, with their traces.

Litmus: **a fresh, weaker-model session should be productive within five minutes of
reading the runway, without re-deriving anything you already know.** If it would have
to re-explore, the note isn't written yet.

> ✅ "next: integrate `loop-engineering` into install.sh (BUNDLES line + warning
> guard); start at `install.sh:12`; flag: none." — five minutes to productive.
> ❌ "made good progress, more to do on the loop stuff" — the next session re-derives
> everything; the note cost a line and saved nothing.

## 5 · The institution is part of the deliverable

Delivery doesn't close until `distill.md` §1's question was asked and answered — even
when the answer is "nothing to file." Same for the character falsification: name one
decision `character/` changed this session, or mark `none-fired` (`character/growth.md`
§5). An iteration that taught something and filed it
nowhere delivered less than it cost, because the next session pays the tuition again.
