# Skill Catalog

## Router

- `sage`: root router, precedence, conflicts, escalation, and auto-chain policy

## Domains

- `ai`: prompts, evals, retrieval, tool-using agents, guardrails
- `architecture`: system shape, constraints, migration, reliability, platform design
- `data-engineering`: data products, pipelines, streaming, contracts, reconciliation
- `development`: implementation, refactor, debugging, Python engineering, optimization
- `devops`: release gates, CI/CD, observability, operational readiness
- `frontend-design`: IA, UX, accessibility, visual systems, style selection
- `infrastructure`: topology, IaC, GitOps, runtime control, tenancy, platform ops
- `mobile`: lifecycle, offline behavior, permissions, client constraints
- `orchestration`: decomposition, sequencing, ownership, integration, handoff
- `security`: trust boundaries, auth, secrets, exploitability, hardening

## Frontend variants

- `claymorphism`
- `glassmorphism`
- `liquid-glass`
- `neubrutalism`

## Workflows

- `investigate`: evidence-first debugging and root-cause isolation
- `bugfix`: minimal safe repair after the cause is known
- `review`: findings-first risk review
- `architecture-decision`: structured tradeoff and migration choice
- `ship`: release readiness, impact, rollback thinking
- `multi-agent`: active parallel execution planning
- `skill-evolution`: improve the skill bundle itself

## Tools

- `gen-docs`: generate module scaffolds and seed docs
- `verify-module`: structural completeness and module packaging checks
- `verify-change`: diff-aware change review and doc-sync checks
- `verify-quality`: code-shape and maintainability checks
- `verify-security`: rule-based security scan and boundary checks
- `verify-skill-system`: skill-bundle integrity, registry coverage, and route-map contract checks

## Guards

- `pre-commit-gate`
- `pre-merge-gate`

## Expert Modules

The route surface is intentionally small.
Most top-end capability now lives in expert modules under `references/`.
The generated machine-readable layer mirrors this through:

- `registry.generated.json` -> `module-groups`
- `route-map.generated.json` -> `expert-modules`

### Architecture modules

- requirements and constraints
- pattern selection
- middleware evolution
- reliability and HA
- performance architecture
- security architecture
- platform governance

### Architecture-decision modules

- decision framing
- option scoring
- migration and rollback
- org and ownership tradeoffs

### Development modules

- Python design and types
- Python concurrency
- Python memory and runtime
- query shape and ORM
- transactions, pagination, and write paths
- bottleneck diagnosis
- batching, caching, and concurrency
- config and runtime boundaries
- observability and shutdown

### Review modules

- findings and severity
- test-surface mapping
- mocks, fixtures, and isolation
- CI signal quality
- release readiness and rollback
- Git and PR discipline
- cause model and proof
- recurrence prevention and defect governance

### DevOps modules

- release gate design
- rollback and release operations
- signal design and instrumentation
- alerts, runbooks, and diagnosis

### Infrastructure modules

- control-plane and tenancy
- cluster shape and environment strategy
- traffic governance and mesh adoption
- runtime policy and identity plane
- failover topology and consistency
- DR exercises and recovery operations

### Security modules

- authn and authz boundaries
- secret lifecycle and rotation
- layered controls and trust zones
- detection, response, and recovery

### AI modules

- task definition
- eval design and acceptance
- retrieval objective and corpus shaping
- chunking, ranking, and grounding
- tool authority and boundaries
- agent loop and state control
- guardrail policy and fallbacks
- latency, cost, and reliability

### Data-engineering modules

- data product framing
- batch and orchestration
- streaming and state
- contracts, quality, and reconciliation

### Orchestration modules

- work decomposition
- ownership and write boundaries
- dependency and integration
- status and handoffs

## Use Strategy

For hard tasks:

1. route into the smallest correct domain or workflow
2. load only the expert modules that match the judgement problem
3. attach tools or guards only when verification is required
