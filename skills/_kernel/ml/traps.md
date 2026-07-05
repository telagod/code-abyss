# Traps — ML's rot catalog: signals, why, fixes

ML rot is the same disease as all rot (`backend/rot.md`): the death of feedback. Here
the feedback organ is the eval — when it isn't trusted, isn't run, or was never built,
every claim in the project is folklore. Each trap: signal → why → fix.

## A · Evaluation rot

1. **Too-good-to-be-true.** Validation at 99% on a hard task. *Why:* it's leakage until
   proven otherwise, and it usually stays leakage. *Fix:* the catalog in `data.md` §2,
   checked in order.
2. **Eval theater.** Cherry-picked demos, testing on training data, no baseline row in
   the table. *Why:* the number persuades but predicts nothing. *Fix:* `approach.md` §4 —
   no baseline, no claim.
3. **Test-set tuning.** Hyperparameters/prompts chosen by repeated test-set peeks.
   *Why:* the test set is now training data with extra steps. *Fix:* `data.md` §3.
4. **Metric without dataset version.** "We hit 91%" — on what, exactly? *Fix:*
   `data.md` §6.
5. **Seed shopping.** Re-running until a good seed wins, reporting the winner. *Fix:*
   `evals.md` §5 — protocol before experiments, variance alongside means.
6. **The unmaintained eval.** The golden set hasn't changed since launch while the
   product and inputs have. *Why:* passing it now certifies the past. *Fix:* every
   production failure becomes a new eval case, same reflex as regression tests.
7. **Goodharted proxy.** The metric climbs, the product doesn't. *Fix:* `evals.md` §4 —
   pair every proxy with a periodic real-outcome check.

## B · Method rot

8. **GPU-first instinct.** Fine-tuning before a prompt was tried; deep nets on 2k
   tabular rows. *Fix:* the ladder (`approach.md` §3), cheapest rung first.
9. **Fine-tuning for knowledge.** See `llm.md` §2: it learns the accent, not the facts.
10. **End-to-end-only RAG debugging.** Prompt rewritten ten times while retrieval was
    returning the wrong chunks all along. *Fix:* `llm.md` §3 — retrieval eval first.
11. **Agent maximalism.** A five-step chain where one good call would do; no step
    budget, no traces. *Fix:* `llm.md` §5.
12. **Solving a WHERE clause with a transformer.** The rule-based baseline was the
    product (`approach.md` §1).

## C · Production rot

13. **Deploy-and-forget.** No drift monitoring; deployment is the START of decay —
    input distributions shift, the world moves. *Fix:* log per-window input stats (null
    rate, category frequencies, numeric mean/std, input length) and output stats (class
    ratios, refusal/error rate); compare against the launch window; alert when a stat
    leaves ±3σ of baseline or a class ratio moves >20% relative. Plus a weekly human
    review of ~50 sampled predictions.
14. **Silent upstream changes.** Provider swaps the model under your API; your prompt's
    behavior changes overnight. *Fix:* pinned versions + scheduled eval runs (`llm.md` §1).
15. **Feedback-loop poisoning.** Model outputs (or user behavior shaped by them) flow
    back into training data. *Why:* the model starts studying its own reflection.
    *Fix:* tag generated/influenced data at the source; exclude or weight explicitly.
16. **The naked percentage.** "94% accurate" with no base rate, no slices, no baseline.
    At a 94% base rate, 94% accuracy is what always predicting the majority class
    scores — zero demonstrated skill. *Fix:* `evals.md` §6 + `approach.md` §4.
17. **Cost blindness.** Works at demo volume; the unit economics at production volume
    were never computed. *Fix:* `approach.md` §5, before building.
18. **Unversioned everything.** Prompt edited in a dashboard, data mutated in place,
    model updated ad hoc — nothing reproducible. *Fix:* prompts/data/models pinned and
    versioned like code; a result you can't reproduce doesn't exist.

## The meta-signal

One question sums an ML project's health: **"if someone claims this change made the
system better, can the claim be checked by running one command?"** Every trap above is
a way the answer becomes "no". The fix is always the same organ: a trusted, versioned,
routinely-run eval.
