# Verify — checking work, weighing reviews, reconciling reports

## 1 · Different lenses beat more eyeballs

N identical skeptics share blind spots. When something can fail in several ways, give each
verifier a *different* failure mode to hunt (does-it-install, are-paths-real, do-rules-
contradict, will-a-literal-reader-misread) — the union of lenses covers what redundancy
can't.

> ✅ The repo's verification round ran four lenses; each lens's biggest catch was invisible
> to the other three (the install-twice failure only surfaces by *running* it; the wrong
> cross-reference number only by *reading* both files).
> ❌ Four agents all prompted "review this repo for problems" return four overlapping
> copies of the most salient issue and miss the quiet ones.

## 2 · Execute the promised journey, not just the artifact

Docs and scripts make promises ("re-run to update", "works from a clean machine"). Verify
by *doing what the doc tells a newcomer to do*, in a sandbox, including the second time and
the failure path. Reading the code cannot catch what only running it reveals.

> ✅ Running `install.sh copy` twice — the exact sequence a recipient updating would run —
> exposed that the second run failed hard. Code-reading missed it; the guard looked
> reasonable in isolation.
> ❌ "The script looks correct and handles the exists-case" — it did handle it: by
> refusing, which was precisely the bug.

## 3 · A finding needs a failure scenario, or it's an opinion

Every reported defect must state: where (`file:line`), what's wrong (one sentence), and the
concrete inputs/state → wrong outcome. If you can't construct the failure scenario, either
verify further or downgrade it to a question. Demand the same of findings you receive.

> ✅ "install.sh:15 — copy mode not idempotent: recipient re-runs the documented command to
> update, guard fires, exit 1, no update path exists" — actionable, checkable, ranked.
> ❌ "The installer could be more robust" — no location, no scenario, no way to know when
> it's fixed.

## 4 · Reconcile reviewer findings against your own knowledge — obey neither blindly

A fresh-context reviewer has fresh eyes AND missing context; you have context AND
attachment to your work. For each finding: accept (fix as suggested), correct (the finding
is wrong — show the evidence), or **reframe** (the observation is real but the conclusion
is off — find the frame where both views are true; see `investigate.md` §4).

> ✅ Of nine review findings, eight were accepted verbatim; one ("Workflow tool doesn't
> exist") was reframed — the observation was real *from a subagent's tool surface* — and
> the reframe produced both a better fix and a recorded lesson.
> ❌ Blanket-applying all nine (deletes a real, working tool from the docs) or defending
> all nine away (ships eight real defects). Both are cheaper than thinking; both are wrong.

## 5 · Re-verify after the fix — fixes are changes too

A fix is new code/text with its own failure modes, often adjacent to the original bug.
After applying review fixes, re-run the test that found the bug AND check what the fix
newly created (`design.md` §6).

> ✅ The idempotency fix was re-run in a fresh sandbox; that re-test is what exposed the
> moved-aside copy registering as a phantom duplicate skill — a bug that did not exist
> before the fix.
> ❌ Marking a finding "fixed" on the strength of the diff looking right — the founding
> doctrine calls this self-certification, and it's how a fix ships its own regression.

## 6 · An honest negative beats a decorated positive

"Verified: X works" requires that you watched X work. If verification was partial, say
which part; if it's still hearsay, say so. Reporting "all checks pass" while one check was
skipped is worse than reporting the skip — downstream decisions compound whatever you claim.

> ✅ "Skill registration through the symlink is verified (invoked it); whether registration
> survives a harness restart is untested — check on next session start."
> ❌ "Everything works end-to-end" when end-to-end was never run end-to-end.
