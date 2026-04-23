# Route Policy

## Intent classes

Classify requests into one or more of:

- knowledge
- execute
- validate
- design
- release
- orchestrate
- self-system

## Precedence

Use this order:

1. explicit skill name
2. self-system work -> `skill-evolution`
3. workflow for action requests
4. tool for explicit checks
5. domain for advisory requests
6. guard only as an attached risk gate

## Conflict rules

### `frontend-design` vs `architecture`

- UI, interaction, accessibility, visual hierarchy -> `frontend-design`
- boundary, data flow, queue, cache, migration, topology -> `architecture`

### `investigate` vs `bugfix`

- uncertain cause, evidence gathering, root-cause search -> `investigate`
- defect is already known and the task is to repair it -> `bugfix`

### `orchestration` vs `multi-agent`

- conceptual decomposition or coordination guidance -> `orchestration`
- active parallel execution plan with owned write surfaces -> `multi-agent`

### `architecture` vs `infrastructure`

- service boundaries, system shape, migration, HA tradeoffs -> `architecture`
- cluster, IaC, runtime controls, identity, GitOps -> `infrastructure`

### `review` vs `verify-*`

- findings-first human-style risk review -> `review`
- deterministic or scan-like validation -> `verify-*`

## Escalation depth

Recommended order:

1. route to the smallest correct skill
2. load that skill's direct references
3. escalate to expert depth only if the base layer is insufficient
4. attach tools or guards when risk and scope justify them

## Self-system routing

Route to `skill-evolution` when the target artifact is the skill system itself, including:

- skill bundle design
- route map or registry changes
- trigger quality
- portability strategy
- pack boundaries
- template quality
- self-hosting governance

## Host guidance

- paste-only host: favor router + domains + workflows first
- folder-capable host: bring tools and guards with scripts
- if the host cannot execute scripts, tools and guards degrade into policy/reference roles