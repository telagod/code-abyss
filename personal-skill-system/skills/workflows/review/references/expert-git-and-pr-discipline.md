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

## Scope hygiene rules

- one PR should preserve one primary risk narrative
- structural refactor and behavior change should be split unless tightly coupled
- generated or mechanical churn should be isolated from semantic changes
- migration and rollback notes must accompany behavior-changing diffs

## Discipline rules

- reviewability is part of engineering quality
- PR size should reflect reasoning boundaries, not convenience batching
- docs, changelog, and migration notes should move with public behavior when needed
- one commit or PR should not force the reviewer to reconstruct several unrelated stories

## Commit quality checks

- commit messages explain intent and risk, not only implementation detail
- commits are bisect-friendly and avoid mixed irreversible states
- force-push or rebase events do not erase reviewer context without explanation
- dependency bumps declare compatibility and rollback implications

## Anti-patterns

- "cleanup" label used to hide behavior changes
- massive PR opened to beat deadline with review deferred to post-merge
- conflict resolution commits that silently drop test or doc updates
- changelog omitted because feature flag is assumed to hide all risk

## Output contract

Leave behind:

- hygiene problem
- why it distorts review quality
- minimal correction path
- risk if correction is deferred
