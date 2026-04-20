# Manual Import Guide

## Goal

`personal-skill-system/` is a portable skill bundle.

## Newcomer Fast Entry

If you are onboarding this system for the first time, start here first:

- `docs/NEWCOMER_OPTIMAL_CALLING_GUIDE.md`
- `docs/TEAM_ONBOARDING_ONE_PAGER.md`
- `docs/ANTV_INTEGRATION_VERDICT_2026-04-20.md`

Then return to this guide for import shape and host-specific strategy.

You can use it in three ways:

1. copy the whole folder as your private skill repository
2. copy selected skill folders into another host runtime
3. paste selected `SKILL.md` files and expert reference fragments into a paste-only host

## Mental model

This bundle now has three useful layers:

1. route surface
2. skill surface
3. expert modules

### Route surface

The route surface is intentionally small:

- `routers/sage`
- domains
- workflows
- tools
- guards

### Skill surface

The skill surface is what the host routes into:

- domains such as `architecture`, `development`, `security`, `ai`
- workflows such as `review`, `bugfix`, `architecture-decision`
- tools and guards when explicit verification is needed

### Expert modules

Expert modules live under `references/`.
They are the real depth layer.

Examples:

- `skills/domains/architecture/references/expert-pattern-selection.md`
- `skills/domains/development/references/expert-python-concurrency.md`
- `skills/workflows/review/references/expert-test-strategy.md`
- `skills/domains/devops/references/expert-release-gates.md`

Do not think of this bundle as only a list of top-level skills.
Think of it as a stable route surface with many deeper capability modules behind it.

The machine-readable view now exposes this as well:

- `registry.generated.json` contains `module-groups`
- `route-map.generated.json` exposes `expert-modules` behind relevant routes

## Important shift

`top_developer/` is no longer meant to be copied as a second parallel bundle.
Its valuable content has been internalized into capability modules inside `personal-skill-system/`.

If you want the provenance map, read:

- `registry/top-developer-integration.generated.json`
- `docs/TOP_DEVELOPER_EMBEDDING.md`

## What to copy first

### Minimum portable set

Start with:

1. `skills/routers/sage/`
2. the domains you use most
3. one or two workflows
4. the tools you trust for verification

### Recommended baseline sets

#### Architecture Elite

- `sage`
- `architecture`
- `architecture-decision`
- `review`
- `devops`
- `infrastructure`
- `security`

#### Backend Elite

- `sage`
- `development`
- `investigate`
- `bugfix`
- `review`
- `verify-change`
- `verify-quality`
- `verify-security`

#### AI Systems Elite

- `sage`
- `ai`
- `architecture`
- `review`
- `orchestration`

#### Data And Platform Elite

- `sage`
- `data-engineering`
- `architecture`
- `devops`
- `infrastructure`

## Folder-capable hosts

If the host supports local skill folders, copy the whole skill directory, not only `SKILL.md`.

Why:

- `references/` carries the real expert depth
- `scripts/` makes tools deterministic
- capability modules stay loadable on demand

## Paste-only hosts

If the host only gives you a text box, do not paste the whole bundle.
Instead:

1. paste `routers/sage/SKILL.md`
2. paste one target domain or workflow `SKILL.md`
3. append only the expert reference fragments needed for the task

### Example: architecture-heavy task

Paste:

1. `skills/routers/sage/SKILL.md`
2. `skills/domains/architecture/SKILL.md`
3. one or more of:
   - `expert-requirements-and-constraints.md`
   - `expert-pattern-selection.md`
   - `expert-middleware-evolution.md`
   - `expert-reliability-and-ha.md`
   - `expert-performance-architecture.md`

### Example: Python performance task

Paste:

1. `skills/routers/sage/SKILL.md`
2. `skills/domains/development/SKILL.md`
3. one or more of:
   - `expert-python-design-and-types.md`
   - `expert-python-concurrency.md`
   - `expert-python-data-access.md`
   - `expert-performance-optimization.md`

### Example: review and release task

Paste:

1. `skills/routers/sage/SKILL.md`
2. `skills/workflows/review/SKILL.md`
3. one or more of:
   - `expert-findings-and-severity.md`
   - `expert-test-strategy.md`
   - `expert-ci-and-release-gates.md`
   - `expert-git-and-pr-discipline.md`
   - `expert-rca-and-defect-management.md`

## How to choose expert modules

Choose by judgement task, not by source persona name.

### Good selection

- pattern selection
- migration and rollback
- Python concurrency
- release gates
- authz and secret governance

### Bad selection

- load the whole top architect
- paste the whole top python dev skill
- bring every expert file because the problem is hard

## Capability-module hotspots

### Architecture

- requirements and constraints
- pattern selection
- middleware evolution
- reliability and HA
- performance architecture
- security architecture
- platform governance

### Development

- Python design and types
- Python concurrency
- Python memory and runtime
- query shape and ORM
- transactions, pagination, and write paths
- bottleneck diagnosis
- batching, caching, and concurrency
- config and runtime boundaries
- observability and shutdown

### Review

- findings and severity
- test-surface mapping
- mocks, fixtures, and isolation
- CI signal quality
- release readiness and rollback
- Git and PR discipline
- cause model and proof
- recurrence prevention and defect governance

### DevOps

- release gate design
- rollback and release operations
- signal design and instrumentation
- alerts, runbooks, and diagnosis

### Infrastructure

- control-plane and tenancy
- cluster shape and environment strategy
- traffic governance and mesh adoption
- runtime policy and identity plane
- failover topology and consistency
- DR exercises and recovery operations

### Security

- authn and authz boundaries
- secret lifecycle and rotation
- layered controls and trust zones
- detection, response, and recovery

### AI

- task definition
- eval design and acceptance
- retrieval objective and corpus shaping
- chunking, ranking, and grounding
- tool authority and boundaries
- agent loop and state control
- guardrail policy and fallbacks
- latency, cost, and reliability

### Data Engineering

- data product framing
- batch and orchestration
- streaming and state
- contracts, quality, and reconciliation

### Orchestration

- work decomposition
- ownership and write boundaries
- dependency and integration
- status and handoffs

## Reading order

For a hard task:

1. router
2. target domain or workflow
3. only the expert modules that match the judgement task
4. tools or guards if validation is needed

## Current bundle reality

This bundle is no longer only a portable skeleton.
It is now:

- portable
- routable
- reference-rich
- partially deterministic through tools
- increasingly expert-modular

What still remains weaker than the long-term target:

- some runtime libraries still carry quality debt
- host-specific smoke import is not yet the main validation surface
- some domains still have less expert splitting than architecture and development
