# Evals — the eval is the spec

You cannot build "better" without a definition of better that runs as code. The eval
comes BEFORE the system, gates every change, and outlives every model swap.

## 1 · Eval before build

First deliverable of any ML/LLM feature: 50–200 golden cases with expected outcomes or
graded properties, plus the metric. Size by the smallest slice you must report, not by
total: a slice needs ~30+ cases before its percentage means anything — below that,
report an interval or a case list, never a naked number (so the 50–200 default scales
with slice count, §6). Writing the eval teaches you the task — ambiguous
cases found here are requirements bugs caught before any engineering. If you cannot
write the eval, you do not understand the feature yet; stop and interrogate
(`approach.md` §2).

## 2 · The metric matches the harm

Choose the metric from the error-asymmetry answer, not from convention: asymmetric
costs → precision/recall at a chosen operating point (or cost-weighted score); ranking
→ recall@k / NDCG; generation → task success rate judged against criteria (and if the
judge is an LLM, it is an instrument that must be calibrated first, §3) — never BLEU
for meaning. Optimizing a proxy without periodically checking the real outcome is how
teams win the metric and lose the product (Goodhart; `traps.md` §7).

## 3 · LLM-feature evals — the modern discipline

- **Golden set** per behavior: inputs + expected properties (contains X, refuses Y,
  cites a source, valid JSON), including the ugly slice: adversarial, long, empty,
  wrong-language inputs.
- **Split the golden set:** a dev slice you iterate prompts against freely, and a
  held-out slice opened only for final claims and release gates — test-set tuning
  (`traps.md` §3) applies to prompts exactly as to hyperparameters.
- **LLM-as-judge is an instrument — calibrate it before trusting it:** measure
  human–human agreement on ~100 adjudicated cases first; the judge is trustworthy when
  its agreement with the adjudicated gold approaches that human ceiling (within ~5
  points), not when it clears a fixed number. Below that, fix the rubric. Re-calibrate
  when the judge model changes.
- **Every prompt or model change runs the full eval** (against the dev slice). Prompts
  are code; the eval is their test suite (`llm.md` §1). "It seems better on the three
  cases I tried" is how regressions ship.
- Track per-case results over time, not just the aggregate — a flat average can hide
  five fixed cases and five newly broken ones.

## 4 · Offline ≠ online

An offline metric gain is a hypothesis, not a result. Ship behind a flag, measure the
actual product outcome (task completion, deflection, retention — whatever the feature
exists for), and expect surprises: the offline eval always undersamples reality. The
gap between the two is itself a number worth tracking.

## 5 · Statistical honesty

Run enough seeds/samples to see the variance before claiming a win — default ≥3 runs
(seeds or resamples), 5 if the claimed gain is under 2 points; a win counts only if the
gain exceeds the max−min spread across those runs (for a golden set of N cases, ±1/√N
is a rough binomial noise band). A 1-point gain inside the noise band is a coin flip
with a press release. Decide the evaluation protocol (splits, seeds, metric, N) BEFORE
running experiments — choosing after is p-hacking with extra steps. The test set is
spent by each look (`data.md` §3): budget single-digit test-set evaluations over the
project's life — one per shipped milestone, written into the protocol up front.

## 6 · Slices, always

Report worst-slice alongside the mean: by class, by input length, by language, by user
segment, by time period. The failure mode of aggregate metrics is that they average
away exactly the group the system fails — and that group finds out in production.

> ✅ "92% overall; 71% on non-English tickets (12% of volume) — gating fix before launch."
> ❌ "92% overall, ship it" — the 71% slice becomes a support escalation with a name.
