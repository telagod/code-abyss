# Expert Context And Retrieval

Use this reference when the AI system depends on documents, context packing, or retrieval quality.

## Core rules

- retrieval quality matters more than simply adding more tokens
- context should be relevant, not merely available
- chunking should preserve meaning boundaries
- ranking should reflect task usefulness, not storage order

## Strong questions

- what evidence does the model actually need
- what context is stale, noisy, or redundant
- where can retrieval introduce false confidence
- how is grounding checked after retrieval

## Output contract

Produce:

- retrieval goal
- context selection strategy
- grounding risks
- fallback when retrieval misses

