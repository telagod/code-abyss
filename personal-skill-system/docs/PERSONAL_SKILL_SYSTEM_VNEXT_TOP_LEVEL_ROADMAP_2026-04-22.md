# PERSONAL_SKILL_SYSTEM vNext Top-Level Roadmap

Date: 2026-04-22
Scope: `personal-skill-system/`
Audience: maintainers of the portable personal skill bundle

## 1. Executive Verdict

The current system is already strong under the `weak-model-uplift` standard:

- route surface is stable
- expert depth is modularized
- deterministic tools and guards exist
- governance metadata is generated and testable
- the bundle can audit itself

It is not yet "absolute top-tier across all covered domains" under a harsher standard.

The main gap is no longer missing structure.
The main gap is proof quality and depth quality:

1. route quality is still mostly heuristic
2. expert depth is uneven across domains
3. deterministic validation is still lightweight heuristic in several tools
4. top-level claims are not backed by externalized uplift benchmarks
5. host-runtime consistency is not yet fully smoked and tracked

vNext should therefore optimize for five outcomes:

1. measurable uplift, not only internal judgement
2. hybrid routing, not keyword-only confidence
3. deeper expert modules in weaker domains
4. stronger proof tools for quality and security
5. repeatable drift control across hosts and packs

## 2. North Star

By the end of vNext, the system should be able to claim:

- a weaker base model is measurably improved on a maintained gold task set
- routing is explainable and robust on mixed-intent prompts
- each core domain has enough expert depth to avoid obvious thin spots
- validation tools provide stronger evidence than pattern matching alone
- the portable bundle behaves consistently across `codex`, `claude`, and `gemini`

## 3. Non-Goals

vNext should not try to:

- turn every domain into an encyclopedia
- expose every expert slice as a public top-level skill
- replace product, code, and security judgement with static tools
- add many new skills before governance and routing improve
- optimize for vanity counts such as "more modules" without better task outcomes

## 4. Current Baseline

## 4.1 What is already strong

- `router + domains + workflows + tools + guards + registry + packs` is the right outer architecture
- generated metadata is consistent enough to be audited automatically
- self-system work has a first-class path through `skill-evolution`
- route fixtures and tool tests already exist
- chart and visualization coverage is unusually strong for a personal bundle

## 4.2 What still blocks a stronger claim

- route selection depends mainly on keywords, aliases, and priority weights
- several "expert" references are still index files or compressed rule cards
- quality and security tools are useful but still heuristic-first
- domain thickness is uneven, especially outside the strongest paths
- there is no maintained before/after benchmark proving uplift by host and task class

## 5. Architecture Direction

vNext should keep the current layer model and improve it in place.

Do not replace the architecture.
Refine it along these lines:

1. keep the route surface stable
2. deepen internal expert modules where judgement is still thin
3. improve routing and proof quality behind the stable surface
4. add benchmark and smoke infrastructure before adding many new public skills

## 6. Workstreams

vNext is split into six workstreams.

### W1. Uplift Benchmarking

Objective:
Prove the system improves weaker models in a repeatable way.

Deliverables:

- `benchmark/tasks/` with gold task sets by domain
- `benchmark/rubrics/` for route correctness, reasoning quality, validation quality, and final correctness
- `benchmark/runs/` for per-host and per-model results
- `benchmark/summary.generated.json` or equivalent report artifact
- benchmark playbook doc with rerun rules and score interpretation

Minimum benchmark coverage:

- architecture
- development
- review
- security
- ai
- chart-visualization
- orchestration

Acceptance criteria:

- at least 10 high-signal tasks per priority domain
- base vs base+skills vs stronger-model comparison exists
- route precision and task completion deltas are recorded
- failures are categorized by route error, depth gap, tool gap, or host issue

### W2. Hybrid Routing

Objective:
Move from pure heuristic routing to a hybrid route engine.

Target design:

1. stage 1: explicit invocation and deterministic overrides
2. stage 2: heuristic candidate generation
3. stage 3: semantic rerank or classifier scoring
4. stage 4: confidence threshold with one-question fallback

Required changes:

- extend `route-map.generated.json` to store more than keywords and priority
- add route rationales and boundary notes per skill
- introduce confidence reporting in route tests
- add mixed-intent and ambiguous fixtures

Acceptance criteria:

- ambiguous fixtures stop passing only because of lucky keywords
- route engine reports candidate list and chosen reason
- mixed-intent prompts show fewer false positives between adjacent domains
- new routing logic degrades safely to explicit invocation

### W3. Expert Depth Equalization

Objective:
Raise weaker domains to the same practical decision quality as the strongest ones.

Priority order:

1. `development`
2. `security`
3. `devops`
4. `data-engineering`
5. `infrastructure`

Required changes:

- split or deepen modules that are currently compressed into index-like expert files
- add more task-shaped decision references instead of generic advice
- preserve "thin entry, deep references" discipline
- keep module IDs stable unless the judgement task truly changes

Specific target improvements:

#### Development

- add first-class expert depth for `typescript`, `go`, `java`, and `rust`
- separate `performance` from general development if task frequency justifies it
- deepen module-level guidance for test design, refactor safety, and runtime failure handling

#### Security

- add supply-chain and dependency trust depth
- add cloud and workload identity depth
- add CI/CD and release boundary abuse cases
- add exploit-path severity framing beyond generic vuln categories

#### DevOps

- deepen progressive delivery, canary judgement, rollback math, and signal design
- add failure-mode based runbook patterns

#### Data Engineering

- deepen replay, late data, idempotency, backfill, and reconciliation operations
- add warehouse cost/performance decision surfaces

#### Infrastructure

- deepen multi-environment policy, secret plane, tenancy migration, and DR drill realism

Acceptance criteria:

- no priority domain depends on a 7-line "expert" index to claim top-level depth
- each priority domain has enough depth to answer tradeoff-heavy prompts without collapsing into generic advice
- weak-model benchmark failures attributable to depth gaps drop materially

### W4. Proof Tool Upgrade

Objective:
Make deterministic tools a stronger source of proof.

Target design:

- keep lightweight heuristics for cheap broad scanning
- add AST-aware checks where language support is practical
- add shallow dataflow/taint reasoning for the highest-risk cases
- keep output compact and actionable

Priority tools:

1. `verify-security`
2. `verify-quality`
3. `verify-change`
4. `pre-commit-gate`
5. `pre-merge-gate`

Specific target improvements:

#### verify-security

- move common JS/TS/Python sinks to AST-backed detection
- add basic source-to-sink path grouping instead of same-file coincidence only
- distinguish test fixtures, docs, and real code more sharply
- improve severity calibration and remediation hints

#### verify-quality

- add AST-backed function extraction for JS/TS where regex is brittle
- add stronger async misuse, error-handling, and boundary-contract checks
- reduce noise from generated or framework boilerplate

#### verify-change

- improve module boundary and compatibility detection
- add API surface, config blast radius, and rollback posture summaries
- expose machine-readable risk classes for downstream guards

#### Guards

- consume structured risk output instead of only warning presence
- support policy tiers such as strict, balanced, and advisory

Acceptance criteria:

- tool false positives decrease on curated fixture sets
- tool true positives increase on known risky cases
- guards block for structured reasons, not just raw warning counts

### W5. Host Runtime and Pack Consistency

Objective:
Guarantee the same bundle behaves coherently across supported hosts.

Deliverables:

- host smoke tasks for `codex`, `claude`, `gemini`
- compatibility matrix for routing, auto-chain behavior, tool invocation, and file layout
- pack promotion checklist for `experimental -> personal-core`
- host capability drift report

Acceptance criteria:

- each host passes a shared smoke matrix
- host-specific differences are recorded and intentional
- no pack claims "portable" while depending on hidden external context

### W6. Governance and Drift Control

Objective:
Turn the current manual maturity claims into a repeatable governance loop.

Deliverables:

- stale-review schedule per domain and workflow
- capability rating review protocol
- fixture growth policy
- generated metadata refresh checklist
- release note template for skill-system changes

Acceptance criteria:

- every structural change updates source, generated metadata, validation, and design assumption
- route fixtures grow when route logic changes
- benchmark reruns are mandatory for routing or depth changes in priority domains

## 7. Milestones

## M0. Baseline Lock

Timebox:
1 week

Goal:
Freeze the baseline and record what "current strong state" actually is.

Tasks:

- snapshot benchmark-less baseline
- record current route fixtures and coverage
- classify current expert references into `real-depth`, `index`, and `legacy-split`
- document domain thickness gaps

Exit gate:

- baseline report checked in
- vNext scope frozen

## M1. Proof Before Expansion

Timebox:
2-3 weeks

Goal:
Build benchmark and smoke scaffolding before deepening content.

Tasks:

- create benchmark harness and rubrics
- define gold tasks for priority domains
- add host smoke tasks
- add route confidence fields and mixed-intent fixtures

Exit gate:

- benchmark can run end to end
- route failures and host failures are distinguishable

## M2. Routing Upgrade

Timebox:
2 weeks

Goal:
Ship hybrid routing with explainability.

Tasks:

- add semantic rerank or classifier stage
- expose route confidence and reason
- expand ambiguous fixtures
- verify fallback behavior

Exit gate:

- route precision improves on gold routing tasks
- no regression on explicit invocation

## M3. Domain Equalization

Timebox:
3-4 weeks

Goal:
Strengthen thinner domains and remove obvious fake-depth claims.

Tasks:

- deepen development, security, devops, data, infrastructure modules
- split index-like references from true expert content
- retire or downgrade misleading expert labels where needed

Exit gate:

- priority domains pass benchmark targets above baseline
- expert references meet minimum depth expectations

## M4. Tool Upgrade

Timebox:
3 weeks

Goal:
Increase proof quality in validators and gates.

Tasks:

- AST upgrades
- taint-lite checks for core sinks
- structured guard policies
- more realistic false-positive fixture sets

Exit gate:

- validator precision and recall improve on fixture packs
- guard output becomes structured and auditable

## M5. Promotion Review

Timebox:
1 week

Goal:
Decide whether vNext is ready to be treated as the new top-tier baseline.

Tasks:

- rerun benchmark
- rerun host smokes
- rerun skill-system verification
- produce release-style design summary

Exit gate:

- claims are backed by data, not only internal narrative
- `experimental` components ready for promotion are identified

## 8. Metrics

Track these metrics continuously:

### Route Metrics

- route precision on fixture set
- route precision on benchmark prompts
- ambiguous prompt fallback rate
- cross-domain false positive rate

### Uplift Metrics

- base vs base+skills completion delta
- validation completeness delta
- route correctness delta
- severity ordering quality for review/security tasks

### Depth Metrics

- average expert reference length is not enough; track task coverage by domain
- number of thin or index-only expert modules in priority domains
- benchmark failure attribution by missing depth class

### Tool Metrics

- false positive rate on curated fixtures
- true positive rate on curated fixtures
- blocked merge precision for guards
- number of warning-only cases that later became real bugs

### Governance Metrics

- stale review compliance
- metadata drift incidents
- host smoke pass rate
- pack portability violations

## 9. Domain Prioritization Matrix

Use this order when resources are limited:

1. `development`: highest frequency, current depth skewed toward Python, broadest uplift value
2. `security`: high-risk mistakes, current proof tooling still heuristic-heavy
3. `review`: already strong, but benchmark value is high and should anchor rubric design
4. `ai`: high leverage for the system's own mission of uplifting weaker models
5. `devops` and `infrastructure`: important for release-grade claims
6. `data-engineering`: deepen after the more common engineering paths are stabilized
7. `frontend-design` and visual variants: maintain, but do not overinvest before proof work lands
8. `chart-visualization`: maintain as flagship depth domain and use it as a model for other domains

## 10. Risks

### Risk 1. Benchmark theater

Failure mode:
Scores improve only because the benchmark is narrow or keyword-biased.

Mitigation:

- mix explicit, implicit, and adversarial prompts
- include mixed-intent tasks
- review failures manually before changing rubrics

### Risk 2. Route sprawl

Failure mode:
Too many public skills are added to fix routing gaps.

Mitigation:

- keep the stable route surface
- prefer deeper internal references and better rerank logic

### Risk 3. Fake depth inflation

Failure mode:
index files are counted as expert depth.

Mitigation:

- classify references by role
- stop counting index-only files as top-tier proof

### Risk 4. Tool overreach

Failure mode:
validators pretend to prove what they cannot prove.

Mitigation:

- label heuristic vs AST vs flow-backed findings clearly
- keep tool confidence visible

### Risk 5. Host divergence

Failure mode:
the bundle behaves differently across `codex`, `claude`, and `gemini` but drift is undocumented.

Mitigation:

- maintain host smoke matrices
- publish known host deltas

## 11. Recommended Immediate Next Moves

If maintainers can only do five things first, do these in order:

1. create the uplift benchmark harness
2. add mixed-intent and ambiguous route fixtures
3. classify current expert references into true depth vs index
4. deepen `development` and `security`
5. upgrade `verify-security` to AST-plus-taint-lite for JS/TS/Python

## 12. Final Standard for vNext

vNext is successful only if all three are true:

1. internal maintainers believe the system is sharper
2. benchmark data shows weaker models materially improve
3. the bundle remains portable, governable, and auditable without route sprawl

If only the first is true, vNext is unfinished.
