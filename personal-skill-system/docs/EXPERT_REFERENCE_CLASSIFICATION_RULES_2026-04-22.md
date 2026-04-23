# EXPERT REFERENCE CLASSIFICATION RULES (2026-04-22)

Scope: `personal-skill-system/`
Card: `CARD-M0-002`

## 1) Purpose

This rule set defines how to classify reference files into:

- `real-depth`
- `index`
- `legacy-split`

The goal is deterministic classification for M0 inventory work, without ad hoc judgement.

## 2) Scope Of Files

Apply to reference files under:

- `personal-skill-system/skills/domains/*/references/*.md`
- `personal-skill-system/skills/workflows/*/references/*.md`

Priority domains for immediate use:

- `development`
- `security`
- `devops`
- `data-engineering`
- `infrastructure`
- `review`
- `ai`

## 3) Classification Decision Order

Classify every file with this order:

1. If the file's primary job is navigation to other files, classify `index`.
2. Otherwise, score depth signals (`D1`-`D6`) and legacy signals (`L1`-`L4`).
3. If depth is strong and not superseded, classify `real-depth`.
4. If depth exists but is transitional/thin/superseded, classify `legacy-split`.

Do not classify by filename prefix alone (for example, `expert-*` does not guarantee `real-depth`).

## 4) Signals And Thresholds

### 4.1 Depth Signals (`D`)

- `D1` Decision order exists (`selection order`, `judgement order`, or explicit decision matrix).
- `D2` Risk/failure modeling exists (`anti-patterns`, `failure modes`, exploit/regression paths).
- `D3` Actionable output contract exists (what deliverable should be left behind).
- `D4` Tradeoff boundaries exist (when to choose A vs B under constraints).
- `D5` Validation cues exist (how to prove correctness/safety/readiness).
- `D6` Edge conditions are explicit (late data, replay, rollback, timeout, boundary drift, etc.).

### 4.2 Index Signals (`I`)

- `I1` The content is primarily a pointer list (for example, "Read by problem type").
- `I2` The file can be removed without losing core judgement rules, as long as pointed files remain.
- `I3` The file has little or no standalone risk/tradeoff guidance.

### 4.3 Legacy-Split Signals (`L`)

- `L1` Some judgement exists, but coverage is thin (usually a short rule card).
- `L2` Scope overlaps with newer split references in the same domain/workflow.
- `L3` Missing key depth sections (`output contract`, failure modes, or validation cues).
- `L4` Historically useful during migration, but no longer sufficient as top-tier evidence.

## 5) Class Definitions

### `real-depth`

Use when:

- `D` score is `>= 4`
- index signals do not dominate
- no clear superseding split makes this file only transitional

Interpretation:

- this file is a standalone expert judgement module
- this file can support top-level depth claims

### `index`

Use when:

- `I1` and at least one of (`I2`, `I3`) hold

Interpretation:

- navigation aid only
- not expert depth evidence

### `legacy-split`

Use when:

- not `index`
- has some depth (`D >= 1`)
- and at least two legacy signals (`L >= 2`)

Interpretation:

- transitional artifact from older broad modules
- useful context, but insufficient as top-tier depth evidence

## 6) Examples From Current Bundle

### 6.1 `real-depth` examples

- `skills/domains/security/references/expert-layered-controls-and-trust-zones.md`
- `skills/workflows/review/references/expert-test-surface-mapping.md`
- `skills/domains/data-engineering/references/expert-streaming-and-state.md`

Why: they include decision rules, failure/anti-pattern coverage, and explicit output contracts.

### 6.2 `index` examples

- `skills/domains/architecture/references/top-developer-overlays.md`
- `skills/domains/development/references/top-developer-overlays.md`
- `skills/workflows/review/references/expert-ci-and-release-gates.md`
- `skills/workflows/review/references/expert-test-strategy.md`
- `skills/workflows/review/references/expert-rca-and-defect-management.md`

Why: these files route readers to sharper modules and do not carry full standalone judgement.

### 6.3 `legacy-split` examples

- `skills/domains/devops/references/expert-release-gates.md`
- `skills/domains/devops/references/expert-observability-operations.md`
- `skills/domains/devops/references/ci-cd-and-release-gates.md`
- `skills/domains/data-engineering/references/streaming-and-state.md`

Why: they retain useful guidance but are thinner/broader than newer split expert modules.

## 7) Top-Level Depth Evidence Policy

For vNext depth proof and ratings:

- `real-depth`: counts as valid top-level depth evidence.
- `index`: does not count.
- `legacy-split`: does not count as top-level proof; track as migration debt.

Operational rule for later cards:

- if a judgement task is covered only by `index` or `legacy-split`, mark it as a `depth gap`.

## 8) Fast Maintainer Checklist (Per File)

1. Is this file primarily navigation? If yes, classify `index`.
2. Does it provide standalone judgement with `D >= 4`? If yes, classify `real-depth`.
3. Does it have some guidance but look transitional/thin and overlapped by newer splits? If yes, classify `legacy-split`.
4. Record one-line reason with the matching signals.
