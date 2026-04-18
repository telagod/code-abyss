# Expert Git And PR Discipline

Use this reference when the review surface is being distorted by poor change hygiene.

## Core rules

- unrelated changes should not travel together
- commit and PR scope should help risk analysis, not hinder it
- docs, changelog, and migration notes should move with public behavior when needed

## Watch for

- hidden refactors inside bugfixes
- formatting churn hiding semantic risk
- branch state assumptions with no explicit note

## Discipline rules

- reviewability is part of engineering quality
- PR size should reflect reasoning boundaries, not convenience batching
- docs, changelog, and migration notes should move with public behavior when needed
- one commit or PR should not force the reviewer to reconstruct several unrelated stories

## Output contract

Leave behind:

- hygiene problem
- why it distorts review quality
- minimal correction path
