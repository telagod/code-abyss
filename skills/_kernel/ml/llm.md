# LLM engineering — context, retrieval, and restraint

The 2026 default: most "ML features" are an LLM call with the right context. The craft
is in the context, the eval, and knowing when NOT to add machinery.

## 1 · Prompts are code

Versioned in git, diffed in review, tested by the eval suite (`evals.md` §3). One prompt
edit = one full eval run, same as any code change. A prompt tuned live in production by
vibes is an unversioned hotfix to your core logic. Pin model versions too — provider
upgrades are silent regressions; re-run the eval on every model change, AND on a
schedule (weekly, or before each release) to catch silent provider-side changes —
pinning reduces but does not eliminate them.

## 2 · Context beats weights for knowledge

Facts, documents, freshness → retrieval at inference time. Fine-tuning is for FORM —
output format, style, tone, tool-use patterns — or for ECONOMICS (a small model matching
a big one on your narrow task). Instruction fine-tuning at practical scale cannot
reliably inject facts — it teaches the accent, not the knowledge, and increases
confident hallucination in your domain. (Adding knowledge via weights requires
continued pretraining on large domain corpora — almost never worth it versus retrieval,
and it still goes stale.)

> ✅ Product-manual Q&A: RAG over the manuals; update = re-index, not re-train.
> ❌ Fine-tune on 500 support tickets "so it knows our product" — it now confidently
> invents features in your house style.

## 3 · RAG: the retriever is usually the problem

Evaluate retrieval SEPARATELY from generation: recall@k on golden query→document pairs,
before any prompt work. If the right chunk isn't retrieved, no prompt fixes the answer.
Defaults that work: chunk by document structure (sections/paragraphs), not fixed
character windows; attach metadata (title, date, source) to every chunk; hybrid
retrieval (BM25 + embeddings) over either alone; when the generator can only see a few
chunks (k ≤ ~5), retrieve a wider pool (~50) and rerank down to k. When the
answer is wrong, check what was retrieved FIRST — generation gets the blame; retrieval
usually deserves it.

## 4 · Structured output and grounding

Extraction/classification: constrained decoding or strict schema validation with one
repair-retry, temperature 0. Generation with claims: ground in retrieved sources, cite,
and give the model an explicit refusal path — "not in the provided context" is a
CORRECT answer and the eval must reward it, or you are training your pipeline to
bluff. High-stakes flows never present unsourced generation as fact.

## 5 · Agents with restraint

Every step in a chain multiplies failure: five 95%-reliable steps = 77% reliable chain.
Prefer one model call with well-prepared context over a multi-step agent; add steps
only when the eval proves the single call can't. Any tool-use loop ships with: a step
budget (default ≤10 steps, then stop and surface partial state), termination criteria,
per-step traces you can read afterwards, and idempotent
tools where retries exist (`backend/logic.md` §5 applies to tool calls too). An agent
that "usually converges" is a while-loop with charisma.

## 6 · Model selection economics

Prove value with the strongest model first — a weak model failing tells you nothing
about the task. Then optimize downward (smaller model, caching, distillation) with the
eval as the tripwire: each downgrade must hold the eval bar. This mirrors
`backend/stack.md` §2: name the two axes you're optimizing (quality/cost/latency) and
what you're paying.

## 7 · Failure handling is product design

LLM calls fail in new ways: refusals, malformed output, timeouts, content-filter
blocks. Each needs a designed path (retry, fallback model, graceful degradation, human
handoff) — not a stack trace reaching the user. Log prompt version + model + input hash
per request, or production issues are unreproducible by construction
(`backend/operate.md` §1). And tag model-generated/influenced data at the source before
it re-enters labels, few-shot pools, or the golden set (`traps.md` §15).
