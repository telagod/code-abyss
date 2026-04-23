# Expert Retrieval Objective And Corpus Shaping

Use this reference when the retrieval problem starts before ranking, at the level of corpus design and evidence intent.

## Core rules

- retrieval should serve a named evidence need
- corpus boundaries should match the task boundary
- stale or low-trust material should not quietly sit beside authoritative sources
- metadata should make later ranking cheaper and sharper

## Strong questions

- what evidence the model actually needs
- what documents should never be mixed into the same retrieval pool
- how freshness and authority are encoded
- what corpus shaping decision would reduce hallucinated confidence

## Corpus design rules

- authoritative and low-trust material should not be silently ranked together
- corpus partitions should reflect product or policy boundaries
- metadata should help later filtering by freshness, owner, and document type
- if one source is operationally critical, make its absence explicit rather than quietly degrade

## Output contract

Leave behind:

- corpus boundary
- trust tiers
- freshness policy
- metadata scheme
