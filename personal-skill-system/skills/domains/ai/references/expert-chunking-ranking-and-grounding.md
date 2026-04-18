# Expert Chunking, Ranking, And Grounding

Use this reference when the retrieval system already has the right corpus and now needs the right slices and ranking.

## Core rules

- chunk on meaning boundaries, not only token counts
- ranking should optimize task usefulness, not storage convenience
- grounding needs explicit checks after retrieval, not blind trust
- duplicated or near-duplicated chunks can distort confidence

## Strong questions

- whether chunks preserve enough local context to answer safely
- what ranking features correlate with correctness
- how the system detects weak or conflicting evidence
- what fallback happens when grounding is insufficient

## Ranking and grounding rules

- chunk size should follow semantic units, not raw token symmetry
- ranking should optimize answer usefulness, not document popularity
- grounding should verify evidence sufficiency before confident output
- conflicting evidence should trigger downgrade, abstain, or escalation rather than confident synthesis by default

## Chunk design heuristics

- split on meaning boundaries such as section, record, or procedure steps
- preserve enough local context that a single chunk can still justify an answer
- avoid chunk layouts that separate definition from exception or caveat
- use overlap only when it preserves meaning, not as a default tax

## Ranking heuristics

- prefer evidence likely to answer the exact question, not merely the broad topic
- freshness, authority, and task fit should all be explicit ranking factors
- duplicated near-matches should not outvote one authoritative source
- a weaker but more direct chunk can beat a broader but prestigious document

## Grounding failure modes

- the chunk is locally relevant but globally misleading
- the evidence is incomplete yet the model sounds certain
- ranking overfits repeated terms and misses decisive context
- conflicting sources are merged instead of surfaced

## Output contract

Leave behind:

- chunking strategy
- ranking factors
- grounding check
- conflict-handling rule
- abstain or downgrade rule

## Output contract

Leave behind:

- chunking strategy
- ranking signals
- grounding check
- weak-evidence fallback
