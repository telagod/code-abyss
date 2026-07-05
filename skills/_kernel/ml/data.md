# Data — look at it with your own eyes

Most "model problems" are data problems visible in twenty minutes of reading examples.
Data work is unglamorous and is where the performance actually lives.

## 1 · Read 100 random examples by hand — before any modeling

Random, not the head of the file. Write down what you saw: label-noise estimate,
format chaos, duplicates, empty fields, the classes that blur together. This 20-minute
ritual regularly invalidates whole project plans — better before the GPU bill.

> ✅ Reading 100 "churn" rows revealed a third were canceled test accounts — the model
> would have learned to detect the QA team.
> ❌ Straight to feature engineering; three weeks later the same discovery, in prod.

## 2 · The leakage catalog — assume it until disproven

If validation looks *too good*, it is leakage until proven otherwise (`traps.md` §1):

- **Temporal:** a feature computed with information from after the prediction moment
  (aggregates over the full history, prices from the future). Split by TIME for any
  process that unfolds in time.
- **Duplicate:** the same (or near-same) row in train and test — common after joins and
  augmentation. Dedup before splitting.
- **Target:** a feature that is the label wearing a costume (`account_closed_reason`
  predicting churn; a diagnosis code predicting the disease).
- **Group:** the same user/patient/device in both splits — the model memorizes the
  entity, not the pattern. Split by GROUP when predictions are per-entity.
- **LLM-era:** few-shot exemplars, prompt examples, and the retrieval corpus count as
  training data — golden eval cases must be disjoint from all of them (dedup and
  near-dup check before freezing the eval).

## 3 · The split mirrors deployment

Ask "at prediction time, what will the model genuinely not know?" and make the split
enforce exactly that. Time-ordered process → time-based split; per-entity task → group
split; otherwise stratified random. **The test set is opened LAST and rarely** — every
peek spends it; tune on the validation set only (`evals.md` §5). The same law governs
LLM golden sets: iterate prompts on a dev slice, hold the rest out (`evals.md` §3).

## 4 · Labels are the ceiling

A model cannot exceed its labels' quality. Before scaling any labeling effort, measure
**chance-corrected** inter-annotator agreement (Cohen's κ / Krippendorff's α) on a
shared sample: below κ ≈ 0.6 the task definition is broken — fix the rubric, not the
model. Raw percent agreement is a valid shortcut only on roughly balanced classes; on
skewed classes (fraud, churn, moderation — the common case) high raw agreement coexists
with near-zero κ, because chance agreement is already high. Disagreed examples are the
spec's edge cases: resolve them in writing, and they become eval gold.

## 5 · Imbalance and slices

At 1:100 class ratio, accuracy is a lie (99% = predicting "no" always). Use
precision/recall at an operating point chosen by the error-asymmetry answer
(`approach.md` §2.4). Always report per-slice performance — the aggregate hides the
demographic, the language, or the input length where the model actually fails
(`evals.md` §6).

## 6 · Version the data like code

Every reported result carries its dataset version/hash. "The model got 91%" without
*on which data* is folklore; results that can't be reproduced from pinned data + pinned
code + pinned config don't exist (`methods/verify.md`, same law).
