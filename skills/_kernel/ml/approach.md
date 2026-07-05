# Approach — framing the problem before touching any model

The governing law of this bundle: **the eval is the spec; anything unmeasured is
folklore.** The second law: reach for the cheapest method that clears the bar, and know
the bar before reaching.

## 1 · Do you even need ML?

If rules, regex, a lookup table, or a `WHERE` clause solves 90% of the cases — ship
that first. You learn this by trying: sketch the rules against the 100 hand-read
examples (`data.md` §1) — an hour's work — and count how many they handle. It is the
baseline, it is debuggable, and it may be the product. ML is
warranted when the pattern exceeds what rules can enumerate AND labeled signal exists
(or can be bought). "We should use AI here" is a solution looking for a problem;
interrogate for the problem first.

## 2 · The interrogation — before naming any method

1. **Labels:** how many exist, how good, what does one more cost?
2. **Latency & cost budget per prediction:** 10ms/free and 2s/$0.01 are different worlds.
3. **Drift:** does the world this predicts change weekly, yearly, never?
4. **Error asymmetry:** which is worse, false positive or false negative, and by how
   much? (It can differ per class, not just per feature — a misrouted legal ticket ≠ a
   misrouted billing ticket.)
5. **Explainability:** does a human/regulator need to know *why*?
6. **Volume:** 100/day tolerates anything; 10M/day makes unit cost the design.

Answers you don't have are **questions for the requester, not assumptions** — the plan
names them explicitly as open inputs.

## 3 · The method ladder — cheapest rung that clears the eval

Climb only when the current rung's failure is MEASURED and understood:

1. **Prompt a frontier LLM** (zero/few-shot) — hours to try; the 2026 default for any
   text/vision understanding task.
2. **+ Retrieval (RAG)** — when the task needs knowledge the model lacks (`llm.md` §2).
3. **Fine-tune a small model** — when format/style/latency/cost demand it, never for
   facts (`llm.md` §2).
4. **Classical supervised (GBDT, logistic regression)** — the default for tabular data
   (GBDTs remain the strong baseline that most deep nets fail to beat at medium/large
   scale; on small tabular sets, pretrained tabular transformers like TabPFN are now
   competitive), for <10ms latency, or for near-zero unit cost at scale.
5. **Train deep from scratch** — rare; needs data volume, infra, and a measured reason
   rungs 1–4 failed.

> ✅ Support-ticket router: frontier LLM + 10 few-shot examples hit 92% in one
> afternoon; the eval said the remaining 8% were mislabeled tickets. Done — until volume
> made unit cost the design; then the 50k historical labels trained a linear classifier
> that matched the LLM at 1/1000th the cost. The rung you ship changes when the
> economics do.
> ❌ Same task, opened with "let's fine-tune a 70B" — three weeks of GPU work to
> underperform the afternoon, because 500 tickets can't teach what the prompt already knew.

## 4 · Baseline discipline — no baseline, no claim

Before any proposed system: run (a) the dumb baseline (majority class, most-recent,
mean), (b) the strong-simple baseline (logistic regression/GBDT for tabular; a
well-prompted frontier model for text — AND, when thousands+ of labels exist, TF-IDF +
linear or a small fine-tuned encoder: near-zero unit cost at volume, so it belongs on
the eval table whenever volume is high), and put them ON the eval. Any system that
can't beat the strongest baseline ships as the baseline. A "94% accuracy" claim means
nothing until the baseline and base rate sit next to it (`traps.md` §16).

When a demanded accuracy exceeds what any model achieves overall, hit it on a subset:
threshold on confidence, automate above it, route the rest to humans. The
coverage-vs-precision curve turns an impossible target into a staffing/coverage
negotiation — offer it before renegotiating the number.

## 5 · Unit economics at design time

tokens/prediction × volume × price = the bill; fine-tune-vs-prompt breakeven, cache hit
rates, and small-model distillation are all decided by this arithmetic, not by taste.
Compute it before building — a feature that costs more per use than it earns is a
failed design that happens to work (`backend/stack.md` §2 two-axis rule, same mechanism).
