---
schema-version: 2
name: review
title: Review Workflow
description: Findings-first review workflow for bugs, regressions, security risk, and missing tests. Use when the user wants an evaluation of changes rather than direct implementation.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [review, code review, audit the change, 评审, 代码审查, 变更审计, code walkthrough, change review, 代码走查]
negative-keywords: [directly implement, 直接实现]
priority: 84
runtime: knowledge
executor: none
permissions: [Read, Grep]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [workflow, review]
aliases: [code-review, 代码评审]
---

# Review Workflow

## Output order

1. findings
2. open questions
3. residual risks
4. brief summary

## Severity order

- correctness
- security
- regression risk
- missing tests
- release risk
- maintainability

## Read These References

- `references/findings-prioritization.md`
  Read when the review surface is large and findings need severity-driven ordering.
- `references/review-checklist.md`
  Read when you want a compact but disciplined pass over behavior, risk, and tests.
- `references/expert-operating-principles.md`
  Read when the review needs stronger approval criteria, finding quality, or senior engineering judgement.
- `references/expert-findings-and-severity.md`
  Read when the hard part is ranking findings and naming why they matter.
- `references/expert-test-surface-mapping.md`
  Read when the review hinges on whether the changed surface is actually covered by the right test layer.
- `references/expert-mocks-fixtures-and-isolation.md`
  Read when mock realism, fixture quality, or isolation strategy may be hiding the real risk.
- `references/expert-ci-signal-quality.md`
  Read when CI appears green but may still be weak evidence, noisy, or blind to the changed surface.
- `references/expert-release-readiness-and-rollback.md`
  Read when release readiness, rollout safety, or rollback posture are part of the review judgement.
- `references/expert-git-and-pr-discipline.md`
  Read when review quality is being distorted by poor PR scope, commit hygiene, or change churn.
- `references/expert-cause-model-and-proof.md`
  Read when the review needs stronger cause-model judgement and evidence quality.
- `references/expert-recurrence-prevention-and-defect-governance.md`
  Read when the review needs stronger recurrence prevention and defect-governance thinking.
- `references/top-developer-overlays.md`
  Read when you want the compact expert index that routes into the split review modules.
