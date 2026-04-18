# Expert Layered Controls And Trust Zones

Use this reference when the security question is whether the architecture has enough independent defensive layers.

## Core rules

- layers should fail independently
- internal zones still need trust assumptions named explicitly
- one control should not carry the entire security posture
- prevention and containment both matter

## Strong questions

- what trust zone each component lives in
- what control fails first if one zone is compromised
- what layer is missing entirely
- what boundary is assumed safe without proof

## Layering rules

- defensive layers should fail independently
- internal zones still require explicit trust assumptions
- one heroic control is weaker than several modest independent ones
- architecture should state where containment begins after prevention fails

## Output contract

Leave behind:

- trust-zone map
- layer stack
- missing layer
- containment stance
