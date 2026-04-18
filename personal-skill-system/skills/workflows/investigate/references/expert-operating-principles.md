# Expert Operating Principles

Use this reference when investigation quality matters more than speed of patching.

## Order of judgement

1. observable symptom
2. reproducibility
3. boundary of impact
4. strongest hypothesis
5. cheapest discriminating test
6. root cause or explicit uncertainty

## Core rules

- never debug a story with no artifact
- one good hypothesis test beats five vague code reads
- if the symptom cannot be reproduced, narrow the environment gap first
- separate trigger, cause, and blast radius
- stop when the evidence chain is coherent enough to justify action, not when curiosity is exhausted

## Failure modes

Watch for:

- phantom bugs caused by stale environment or config drift
- cause/effect inversion
- fixing the symptom instead of the mechanism
- investigating everything because nothing was prioritized
- letting logs replace reasoning

## Exit criteria

An investigation is done when one is true:

- root cause is established with evidence
- highest-probability cause is isolated enough to justify a targeted fix
- remaining uncertainty is explicit and bounded

## Output contract

Leave behind:

- symptom
- reproduction surface
- strongest evidence
- tested hypotheses
- root cause or bounded unknown
- next action
