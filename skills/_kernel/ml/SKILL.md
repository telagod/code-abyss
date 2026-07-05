---
user-invocable: true
name: ml
description: Machine learning and LLM engineering judgment, distilled from a stronger model - invoke when DECIDING whether/how to use ML or an LLM for a task (prompt vs RAG vs fine-tune vs classical); working with training/eval data or labels; building or reviewing evals for models and LLM features; designing RAG, structured output, or agent pipelines; or diagnosing why a model/LLM feature underperforms. Method-selection ladder, data and leakage discipline, eval-as-spec rules, LLM-era craft, and a trap catalog.
---

# ML — approach, data, evals, LLM craft, traps

Rule content lives in the five files below; this SKILL.md only routes
(`doctrine/04-maintenance.md` governs edits to this bundle too).

## Route by moment

| You are about to… | Read (in this folder) |
|---|---|
| Decide whether ML/an LLM is warranted, and which method rung to use | `approach.md` |
| Touch a dataset, labels, or splits; suspect a score is too good | `data.md` |
| Define success, build/judge an eval, or assess someone's metric claim | `evals.md` |
| Build with LLMs: prompts, RAG, structured output, agents, model choice | `llm.md` |
| Diagnose an underperforming model or LLM feature | `data.md` §1 first (read real failures), then `llm.md` §3 if RAG, `traps.md` to name the pattern |
| Review an ML project's health; name why a claim or pipeline smells wrong | `traps.md` |

A new ML feature usually runs `approach.md` (interrogate + pick the rung) →
`evals.md` §1 (eval BEFORE build) → `data.md` → then `llm.md` if the rung is LLM-shaped
→ skim `traps.md` §C before finalizing any launch or monitoring plan.

## Scope and neighbors

Modeling and evaluation judgment. The serving infrastructure around a model is ordinary
backend (`backend` bundle: APIs, queues, operate.md); experiment execution discipline is
`methods` (investigate/verify); whether to delegate → `doctrine`.

## The stance

**The eval is the spec; anything unmeasured is folklore.** Look at the data with your
own eyes (`data.md` §1), climb the method ladder from the cheapest rung (`approach.md`
§3), and treat every surprising score as leakage until disproven (`data.md` §2). The
failure mode of this field is not bad models — it is unearned confidence in numbers.
