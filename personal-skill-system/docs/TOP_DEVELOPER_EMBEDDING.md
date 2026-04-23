# Top Developer Embedding

## Verdict

`top_developer/` is now treated as raw source material and fused into
`personal-skill-system/` itself.

The portable target is no longer "read external overlays from `top_developer/`".
The portable target is:

1. keep routing in existing `domain` and `workflow` skills
2. internalize expert depth into their `references/`
3. preserve a mapping record so the origin of each expert slice is still visible

This keeps `personal-skill-system/` copy-pasteable as a standalone skill source.

## Why this shape wins

- direct copy of all eight monster skills would create overlap and route collisions
- the portable system already has the right outer layer model
- rich depth belongs in references that load on demand
- one portable folder should stand on its own, without requiring sibling folders outside it

## Mapping

The system no longer treats `top_developer` as a few giant overlays.
It now maps those sources into capability modules grouped under host skills.

Current capability groups:

- `architecture`: 7 expert modules
- `architecture-decision`: 4 expert modules
- `development`: 6 expert modules
- `review`: 5 expert modules
- `devops`: 2 expert modules
- `infrastructure`: 3 expert modules
- `security`: 2 expert modules

## What was preserved

- trigger surface and escalation signals
- architecture pattern guidance
- platform decision frameworks
- middleware evolution rules
- performance methodology
- Python engineering depth
- QA and release-readiness discipline

## What was intentionally normalized

- overlapping platform-architect variants were collapsed into one portable architecture-depth reference
- repetitive examples were summarized into reusable rules
- route ownership stayed with existing `domain` and `workflow` skills

## Current split state

The highest-value split now starts in:

- `architecture`
  - requirements and constraints
  - pattern selection
  - middleware evolution
  - reliability and HA
  - performance architecture
  - security architecture
  - platform governance
- `architecture-decision`
  - decision framing
  - option scoring
  - migration and rollback
  - org and ownership tradeoffs

This is the preferred direction for the remaining `top_developer` material as well:
split by judgement task, not by original source file.

The machine-readable source of truth for this split is now:

- `registry/top-developer-integration.generated.json`

## Pack strategy

- Current stage: `experimental`
- Reason: expert depth has been internalized, but promotion to a baseline pack should wait until usage proves the route balance is stable.

## Future extraction rules

- If performance work becomes frequent enough, split a first-class `performance` domain instead of overloading both `architecture` and `development`.
- If quality governance grows beyond review, split a first-class `qa` or `engineering-quality` domain.
- If you later want portable route tests, add embedded trigger-regression fixtures under `registry/` instead of depending on external `evals/`.
